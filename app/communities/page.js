import ListingsIndex from "@/components/ListingsIndex";
export const metadata = { title: "Communities" };
export default async function Page({ searchParams }) {
  const { q } = await searchParams;
  return <ListingsIndex type="community" q={typeof q === "string" ? q.slice(0, 100) : ""} />;
}
