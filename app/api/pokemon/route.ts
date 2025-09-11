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
};

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    const limit = searchParams.get("limit");

    try {
        if (name) {
            const res = await fetch(`${BASE_URL}/pokemon/${name}`);
            const data = await res.json();
            const speciesRes = await fetch(`${BASE_URL}/pokemon-species/${data.id}`);
            const speciesData = await speciesRes.json();

            return NextResponse.json({
                ...data,
                color: speciesData.color.name,
            });
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
                    const speciesData = await speciesRes.json();
                    return {
                        id: pokeData.id,
                        name: pokeData.name,
                        gen: pokeData.generation,
                        types: pokeData.types,
                        sprites: pokeData.sprites,
                        color: speciesData.color.name,
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