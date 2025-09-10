import { NextResponse } from "next/server";

const BASE_URL = "https://pokeapi.co/api/v2";

export type Pokemon = {
    name: string;
    sprites?: {
        front_default: string;
    };
};

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    const limit = searchParams.get("limit");

    try {
        if (name) {
            const res = await fetch(`${BASE_URL}/pokemon/${name}`);
            const data = await res.json();
            return NextResponse.json(data);
        }

        if (limit) {
            const res = await fetch(`${BASE_URL}/pokemon?limit=${limit}`);
            const data = await res.json();

            const detailed = await Promise.all(
                data.results.map(async (p: any) => {
                    const pokeRes = await fetch(p.url);
                    const pokeData = await pokeRes.json();
                    return {
                        name: pokeData.name,
                        sprites: pokeData.sprites,
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
