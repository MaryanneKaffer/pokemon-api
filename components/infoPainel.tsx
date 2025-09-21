"use client";

import { useEffect, useState } from "react";
import { Pokemon } from "@/app/api/pokemon/route";
import getTypeIconUrl from "./typesImgs";
import { colorMap } from "@/components/cardColorMap";
import { IoCloseSharp } from "react-icons/io5";
import { Button } from "@heroui/button";
import Loader from "./loader";
import { AnimatePresence, motion } from "framer-motion";

export default function InfoPainel({ name, setOpenInfo }: { name: string, setOpenInfo: any }) {
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
        <section className={`w-full h-full bg-gradient-to-b transition-all ${colorMap[pokemon?.color ?? ""] || "from-gray-400"} via-default to-default flex flex-col py-[80px] rounded-xl p-4`}>
            <Button className="absolute right-2 bg-transparent absolute right-5 top-5 min-w-[45px] p-0" onPress={() => setOpenInfo("")}><IoCloseSharp size={30} /></Button>
            {loading && <Loader />}
            <AnimatePresence mode="wait">
                {!loading && pokemon && (
                    <motion.div className="flex flex-col gap-4 items-center h-full transition-colors" key={pokemon.name}
                        initial={{ opacity: 0, }} animate={{ opacity: 1, }} exit={{ opacity: 0, }} transition={{ duration: 0.3 }}
                    >
                        <img className="size-[200px]" src={pokemon.sprites?.front_default} alt={pokemon.name} />
                        <h2 className="text-2xl font-bold capitalize">{pokemon.name}</h2>
                        {pokemon.characteristic && (
                            <p className="text-sm">{pokemon.characteristic}</p>
                        )}
                        <span className="flex gap-1 mt-auto">{pokemon.types?.map((t) => (
                            <img key={t.slot} className="h-6" src={getTypeIconUrl(t.type.url)} alt={t.type.name} title={t.type.name} />
                        ))}</span>
                    </motion.div>
                )}
            </AnimatePresence>
            {!pokemon && !loading && <p className="text-gray-500">Error</p>}
        </section>
    );
}