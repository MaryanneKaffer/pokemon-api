export default function InfoPainel({ id }: { id: number }) {
    return (
        <section className="h-[600px] w-[580px] bg-default-200/100 flex justify-center sticky top-10 rounded-xl">
            <p>{id}</p>
        </section>
    )
}