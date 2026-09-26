import ListingsIndex from "@/components/ListingsIndex";
export const metadata = { title: "Events" };
export default async function Page({ searchParams }) {
  const { q } = await searchParams;
  return <ListingsIndex type="event" q={typeof q === "string" ? q.slice(0, 100) : ""} />;
}
