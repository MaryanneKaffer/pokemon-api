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

    if (!name) {
        return NextResponse.json({ error: "Missing Pokémon ID" }, { status: 400 });
    }

    try {
        const pokeRes = await fetch(`${BASE_URL}/pokemon/${name}`);
        if (!pokeRes.ok) {
            return NextResponse.json({ error: "Pokémon not found" }, { status: 404 });
        }
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

        return NextResponse.json({
            id: pokeData.id,
            name: pokeData.name,
            types: pokeData.types,
            sprites: pokeData.sprites,
            color: speciesData?.color?.name ?? "unknown",
            characteristic,
        } as Pokemon);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch data from PokéAPI" },
            { status: 500 }
        );
    }
}