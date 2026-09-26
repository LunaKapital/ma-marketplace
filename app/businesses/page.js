import ListingsIndex from "@/components/ListingsIndex";
export const metadata = { title: "businesses" };
export default async function Page({ searchParams }) {
  const { q } = await searchParams;
  return <ListingsIndex type="business" q={typeof q === "string" ? q.slice(0, 100) : ""} />;
}
