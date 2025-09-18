"use client";

import { ThemeSwitch } from "@/components/theme-switch";
import { useEffect, useState } from "react";
import { Pokemon } from "./api/pokemon/route";
import { Card } from "@heroui/card";
import { Input } from "@heroui/input";
import { colorMap } from "@/components/cardColorMap";
import { SearchIcon } from "@/components/icons";
import Loader from "@/components/loader";
import { TbPokeball } from "react-icons/tb";
import { Button } from "@heroui/button";
import InfoPainel from "@/components/infoPainel";
import getTypeIconUrl from "@/components/typesImgs";

export default function Home() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [openInfo, setOpenInfo] = useState("");

  async function fetchPokemons(limit: number = 48) {
    setLoading(true);
    try {
      const res = await fetch(`/api/pokemon?limit=${limit}`);
      const data = await res.json();
      setPokemons(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function searchPokemon(pokemonName: string) {
    if (!pokemonName) {
      fetchPokemons();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/pokemon?name=${pokemonName.toLowerCase()}`);
      if (!res.ok) {
        setPokemons([]);
        return;
      }
      const data = await res.json();
      setPokemons(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error(err);
      setPokemons([]);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    fetchPokemons();
  }, []);

  return (
    <section className="flex justify-center gap-2">
      <div className={`flex flex-col ${openInfo ? "w-fit" : "w-full"} gap-4`}>
        <div className={`flex gap-2 w-full pr-3`}>
          <Input className="w-full" isClearable placeholder="Type to search..." size="lg" radius="lg" startContent={<SearchIcon />}
            onClear={() => { fetchPokemons(); }}
            onChange={(e) => {
              const value = e.target.value;
              value ? searchPokemon(value) : fetchPokemons();
            }}
            classNames={{
              label: "text-black/50 dark:text-white/90",
              inputWrapper: [
                "hover:bg-default-200/70",
                "dark:hover:bg-default",
                "dark:bg-default-200/70",
                "bg-default",
              ],
            }}
          />
          <ThemeSwitch />
        </div>
        {loading && <Loader />}
        <div className="flex flex-wrap gap-2 w-full gap-4.5">
          {pokemons.length > 0 ? pokemons.map((poke, i) => (
            <Card key={poke.name + i} className={`flex w-[200px] h-[230px] items-center p-5 group text-center hover:scale-105 bg-gradient-to-b 
          ${colorMap[poke.color ?? ""] || "from-gray-400"} via-default to-default`}>
              <Button className="group-hover:opacity-100 opacity-0 bg-transparent absolute right-2 top-2 transition-all min-w-[45px] p-0 text-white" startContent={<TbPokeball size={26} />} onPress={() => setOpenInfo(poke.name)} />
              <img className="size-[106px]" src={poke.sprites?.front_default} alt={poke.name} />
              <p className="capitalize">{poke.name} <span className="text-gray-500">#{poke.id}</span></p>
              <p className="text-sm">{poke.characteristic}</p>
              <span className="flex gap-1 mt-auto">{poke.types.map((t) => (
                <img key={t.slot} className="h-4" src={getTypeIconUrl(t.type.url)} alt={t.type.name} title={t.type.name} />
              ))}</span>
            </Card>
          ))
            : !loading && <p className="mt-5">Nothing found...</p>}
        </div>
      </div>
      {openInfo ? <InfoPainel name={openInfo} /> : ""}
    </section>
  );
}