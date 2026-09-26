import ListingsIndex from "@/components/ListingsIndex";
export const metadata = { title: "real-estate" };
export default async function Page({ searchParams }) {
  const { q } = await searchParams;
  return <ListingsIndex type="realestate" q={typeof q === "string" ? q.slice(0, 100) : ""} />;
}
