"use client";

import { ThemeSwitch } from "@/components/theme-switch";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import { Pagination } from "@heroui/pagination";

export default function Home() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [openInfo, setOpenInfo] = useState("");
  const [page, setPage] = useState(1);
  const limit = 48;
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  async function fetchPokemons(pageNum: number = 1, limitNum: number = 48, name?: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(pageNum));
      params.set("limit", String(limitNum));
      if (name) params.set("name", name.trim().toLowerCase());

      const res = await fetch(`/api/pokemon?${params.toString()}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setPokemons(data);
        setTotal(data.length);
      } else {
        setPokemons(data.results || []);
        setTotal(data.count || 0);
      }
    } catch (err) {
      console.error(err);
      setPokemons([]);
      setTotal(0);
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
      setTotal(data.count || 0);
    } catch (err) {
      console.error(err);
      setPokemons([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPokemons(page, limit, search || undefined);
  }, [page, search]);


  return (
    <section className="flex justify-center gap-2 transition-all">
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
              inputWrapper: ["hover:bg-default-200/70", "dark:hover:bg-default", "dark:bg-default-200/70", "bg-default",
              ],
            }}
          />
          <ThemeSwitch />
        </div>
        {loading && <Loader />}
        <div className="flex flex-wrap gap-2 w-full gap-4.5 ">
          {!loading && pokemons.length > 0 ? pokemons.map((poke, i) => (
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
        {!loading && (<Pagination className="mx-auto my-auto" showControls classNames={{ cursor: "bg-red-900 rounded-full", item: "rounded-full" }}
          total={Math.ceil(total / limit)}
          page={page}
          onChange={(newPage) => { setPage(newPage); setOpenInfo("") }} />)}
      </div>
      <AnimatePresence>
        {!loading && openInfo && (
          <motion.div className="h-[600px] w-[580px] sticky top-10" key="info-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <InfoPainel name={openInfo} setOpenInfo={setOpenInfo} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}