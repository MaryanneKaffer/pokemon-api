import { NextResponse } from "next/server";

const BASE_URL = "https://pokeapi.co/api/v2";

export type PokemonType = {
    slot: number;
    type: {
        name: string;
        url: string;
    };
};

export type Pokemon = {
    id: number;
    name: string;
    types: PokemonType[];
    sprites?: {
        front_default: string;
    };
    color?: string;
    characteristic?: string;
};

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    const limit = searchParams.get("limit");

    async function safeJson(res: Response) {
        try {
            return await res.json();
        } catch {
            return null;
        }
    }

    try {
        if (name) {
            const query = name.trim().toLowerCase();
            if (!query) {
                return NextResponse.json([], { status: 200 });
            }

            const listRes = await fetch(`${BASE_URL}/pokemon?limit=2000`);
            if (!listRes.ok) {
                return NextResponse.json({ error: "Failed to fetch pokemon list" }, { status: 502 });
            }
            const listData: any = await safeJson(listRes);
            const all = Array.isArray(listData?.results) ? listData.results : [];

            const filtered = all.filter((p: any) =>
                typeof p.name === "string" && p.name.toLowerCase().includes(query)
            );

            const MAX_MATCHES = 50;
            const toFetch = filtered.slice(0, MAX_MATCHES);

            const promises = toFetch.map(async (p: any) => {
                try {
                    const pokeRes = await fetch(p.url);
                    if (!pokeRes.ok) return null;
                    const pokeData = await pokeRes.json();

                    const speciesRes = await fetch(`${BASE_URL}/pokemon-species/${pokeData.id}`);
                    const speciesData = speciesRes.ok ? await speciesRes.json() : { color: { name: "unknown" } };

                    let characteristic: string | undefined;
                    try {
                        const charRes = await fetch(`${BASE_URL}/characteristic/${pokeData.id}`);
                        if (charRes.ok) {
                            const charData = await charRes.json();
                            const desc = (charData.descriptions || []).find((d: any) => d.language?.name === "en");
                            characteristic = desc?.description;
                        }
                    } catch {
                        characteristic = undefined;
                    }

                    return {
                        id: pokeData.id,
                        name: pokeData.name,
                        types: pokeData.types,
                        sprites: pokeData.sprites,
                        color: speciesData?.color?.name ?? "unknown",
                        characteristic,
                    } as Pokemon;
                } catch {
                    return null;
                }
            });

            const settled = await Promise.allSettled(promises);
            const detailed = settled
                .filter((s) => s.status === "fulfilled" && (s as any).value)
                .map((s) => (s as PromiseFulfilledResult<Pokemon | null>).value)
                .filter(Boolean);

            return NextResponse.json(detailed);
        }

        if (limit) {
            const res = await fetch(`${BASE_URL}/pokemon?limit=${limit}`);
            const data = await res.json();
            const detailed = await Promise.all(
                data.results.map(async (p: any) => {
                    const pokeRes = await fetch(p.url);
                    const pokeData = await pokeRes.json();
                    const speciesRes = await fetch(
                        `${BASE_URL}/pokemon-species/${pokeData.id}`
                    );
                    let characteristic: string | undefined;
                    try {
                        const charRes = await fetch(`${BASE_URL}/characteristic/${pokeData.id}`);
                        if (charRes.ok) {
                            const charData = await charRes.json();
                            const desc = charData.descriptions.find(
                                (d: any) => d.language.name === "en"
                            );
                            characteristic = desc?.description;
                        }
                    } catch {
                        characteristic = undefined;
                    }
                    const speciesData = await speciesRes.json();
                    return {
                        id: pokeData.id,
                        name: pokeData.name,
                        types: pokeData.types,
                        sprites: pokeData.sprites,
                        color: speciesData.color.name,
                        characteristic,
                    };
                })
            );

            return NextResponse.json(detailed);
        }

        return NextResponse.json({ error: "Missing params" }, { status: 400 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch data from PokéAPI" },
            { status: 500 }
        );
    }
}