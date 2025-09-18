"use client";

import { useEffect, useState } from "react";
import { Pokemon } from "@/app/api/pokemon/route";
import getTypeIconUrl from "./typesImgs";
import { colorMap } from "@/components/cardColorMap";

export default function InfoPainel({ name }: { name: string }) {
    const [pokemon, setPokemon] = useState<Pokemon>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPokemon() {
            setLoading(true);
            try {
                const res = await fetch(`/api/pokemon?name=${name}`);
                if (!res.ok) throw new Error("Couldn't find pokemon");
                const data: Pokemon[] = await res.json();
                setPokemon(data[0]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchPokemon();
    }, [name]);

    return (
        <section className={`h-[600px] w-[580px] bg-gradient-to-b ${colorMap[pokemon?.color ?? ""] || "from-gray-400"} via-default to-default flex flex-col py-[80px] sticky top-10 rounded-xl p-4`}>
            {loading ? <p className="text-gray-500">Loading...</p> :
                pokemon && (
                    <div className="flex flex-col gap-4 items-center h-full">
                        <img className="size-[200px]" src={pokemon.sprites?.front_default} alt={pokemon.name} />
                        <h2 className="text-2xl font-bold capitalize">{pokemon.name}</h2>
                        {pokemon.characteristic && (
                            <p className="text-sm">{pokemon.characteristic}</p>
                        )}
                        <span className="flex gap-1 mt-auto">{pokemon.types?.map((t) => (
                            <img key={t.slot} className="h-6" src={getTypeIconUrl(t.type.url)} alt={t.type.name} title={t.type.name} />
                        ))}</span>
                    </div>
                )}
            {!pokemon && !loading && <p className="text-gray-500">Error</p>}
        </section>
    );
}