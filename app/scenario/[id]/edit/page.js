"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/AppHeader";
import Card from "@/components/Card";
import ScenarioForm from "@/components/ScenarioForm";
import { getScenario, updateScenario } from "@/lib/storage";

function EditScenarioContent() {
  const { id } = useParams();
  const router = useRouter();
  const [scenario, setScenario] = useState(undefined);

  useEffect(() => {
    // localStorage is only available on the client, after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScenario(getScenario(id));
  }, [id]);

  function handleSubmit(data) {
    updateScenario(id, data);
    router.push(`/scenario/${id}`);
  }

  if (scenario === undefined) {
    return <p className="p-8 text-sm text-muted">Loading...</p>;
  }

  if (scenario === null) {
    return <p className="p-8 text-sm text-muted">Scenario not found.</p>;
  }

  return (
    <div className="min-h-screen">
      <AppHeader title={`Edit "${scenario.name}"`} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Card className="animate-fade-up">
          <ScenarioForm initialData={scenario} onSubmit={handleSubmit} submitLabel="Save changes" />
        </Card>
      </main>
    </div>
  );
}

export default function EditScenarioPage() {
  return (
    <AuthGuard>
      <EditScenarioContent />
    </AuthGuard>
  );
}
