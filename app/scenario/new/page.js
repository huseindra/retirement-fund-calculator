"use client";

import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/AppHeader";
import Card from "@/components/Card";
import ScenarioForm from "@/components/ScenarioForm";
import { createScenario } from "@/lib/storage";

function NewScenarioContent() {
  const router = useRouter();

  function handleSubmit(data) {
    const scenario = createScenario(data);
    router.push(`/scenario/${scenario.id}`);
  }

  return (
    <div className="min-h-screen">
      <AppHeader title="New scenario" />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Card className="animate-fade-up">
          <ScenarioForm onSubmit={handleSubmit} submitLabel="Create scenario" />
        </Card>
      </main>
    </div>
  );
}

export default function NewScenarioPage() {
  return (
    <AuthGuard>
      <NewScenarioContent />
    </AuthGuard>
  );
}
