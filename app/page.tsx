"use client";

import { ThemeSwitch } from "@/components/theme-switch";
import { useEffect, useState } from "react";
import { Pokemon } from "./api/pokemon/route";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";

export default function Home() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchPokemons(limit: number = 10) {
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

  useEffect(() => {
    fetchPokemons(27);
  }, []);

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <ThemeSwitch />
      {loading && <Button isLoading className="bg-transparent size-[100px] my-auto" spinner={
        <svg className="animate-spin" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
        </svg>}></Button>}
      <div className="flex flex-wrap gap-2 w-full justify-between">
        {pokemons.map((poke, i) => (
          <Card key={poke.name + i} className="flex w-[200px] h-[260px] items-center py-5">
            <img className="size-[106px]" src={poke.sprites?.front_default} alt={poke.name} />
            <p className="capitalize">{poke.name}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
