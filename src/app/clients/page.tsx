import { ClientList } from "@/components/ClientList";

export default function ClientsPage() {
  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-6">Clients & Projects</h1>
      <ClientList />
    </div>
  );
}
