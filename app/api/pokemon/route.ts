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
    id: string;
    name: string;
    gen: string;
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

    try {
        if (name) {
            const listRes = await fetch(`${BASE_URL}/pokemon?limit=1025`);
            const listData = await listRes.json();

            const filtered = listData.results.filter((p: any) =>
                p.name.includes(name.toLowerCase())
            );

            const detailed = await Promise.all(
                filtered.map(async (p: any) => {
                    const pokeRes = await fetch(p.url);
                    const pokeData = await pokeRes.json();

                    const speciesRes = await fetch(
                        `${BASE_URL}/pokemon-species/${pokeData.id}`
                    );
                    const speciesData = await speciesRes.json();

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
                        gen: pokeData.generation,
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