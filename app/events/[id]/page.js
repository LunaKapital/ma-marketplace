import ListingDetail from "@/components/ListingDetail";
export default async function Page({ params }) {
  const { id } = await params;
  return <ListingDetail type="event" id={id} />;
}
