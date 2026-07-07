export const dynamic = "force-dynamic"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RegistroDiario } from "@/components/suplementos/RegistroDiario"
import { ConfiguracaoSuplemento } from "@/components/suplementos/ConfiguracaoSuplemento"

export default function SuplementosPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Suplementos</h1>
      <Tabs defaultValue="registro">
        <TabsList className="bg-secondary">
          <TabsTrigger value="registro">Registro diário</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
        </TabsList>
        <TabsContent value="registro" className="mt-4">
          <RegistroDiario />
        </TabsContent>
        <TabsContent value="config" className="mt-4">
          <ConfiguracaoSuplemento />
        </TabsContent>
      </Tabs>
    </div>
  )
}
