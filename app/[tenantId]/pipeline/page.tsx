"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/store";
import {
  deals as dealsApi,
  pipeline as pipelineApi,
  companies as companiesApi,
  contacts as contactsApi,
  type Deal,
  type PipelineStage,
  type Company,
  type Contact,
  ApiError,
} from "@/lib/api";
import Header from "@/components/layout/Header";
import { useRole } from "@/lib/hooks/useRole";
import {
  Loader2,
  DollarSign,
  Calendar,
  Building2,
  User,
  X,
  Plus,
  ChevronRight,
} from "lucide-react";

export default function PipelinePage() {
  const { currentTenant } = useAuthStore();
  const { canEditDeals } = useRole();
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [showQuickCreate, setShowQuickCreate] = useState<string | null>(null);
  const [markingAsLost, setMarkingAsLost] = useState<Deal | null>(null);

  const load = useCallback(() => {
    if (!currentTenant) return;
    setLoading(true);
    Promise.all([
      pipelineApi.list(currentTenant.id),
      dealsApi.list(currentTenant.id),
      companiesApi.list(currentTenant.id),
      contactsApi.list(currentTenant.id),
    ])
      .then(([s, d, comp, cont]) => {
        setStages(
          s.data.sort(
            (a: PipelineStage, b: PipelineStage) => a.position - b.position
          )
        );
        setAllDeals(d.data);
        setCompanies(comp.data);
        setContacts(cont.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentTenant]);

  useEffect(load, [load]);

  const updateDealStage = async (dealId: string, stageId: string) => {
    if (!currentTenant) return;
    try {
      await dealsApi.update(currentTenant.id, dealId, { stage_id: stageId });
      load();
    } catch {
      // silently fail
    }
  };

  const getCompanyName = (id?: string) =>
    companies.find((c) => c.id === id)?.name;
  const getContactName = (id?: string) => {
    const c = contacts.find((i) => i.id === id);
    return c ? `${c.first_name} ${c.last_name || ""}`.trim() : undefined;
  };

  // Total pipeline value
  const totalPipeline = allDeals
    .filter((d) => d.status === "open")
    .reduce((s, d) => s + (d.value || 0), 0);

  return (
    <>
      <Header title="Pipeline">
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs font-medium text-muted-foreground">
              Pipeline Total
            </p>
            <p className="text-sm font-bold tracking-tight">
              €{totalPipeline.toLocaleString("es-ES")}
            </p>
          </div>
          <div className="h-8 w-px bg-border/50 hidden md:block" />
          <p className="text-xs font-medium text-muted-foreground hidden md:block">
            {allDeals.filter((d) => d.status === "open").length} deals abiertos
          </p>
        </div>
      </Header>

      <div className="flex-1 overflow-x-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={24} />
          </div>
        ) : stages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <ChevronRight size={24} className="text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              Sin etapas de pipeline
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Configura las etapas de tu pipeline en la base de datos.
            </p>
          </div>
        ) : (
          <div className="flex gap-3 pb-4" style={{ minHeight: "calc(100vh - 180px)" }}>
            {stages.map((stage, idx) => {
              const stageDeals = allDeals.filter(
                (d) => d.stage_id === stage.id && d.status === "open"
              );
              const stageValue = stageDeals.reduce(
                (s, d) => s + (d.value || 0),
                0
              );

              const progressPercent = stages.length > 1 ? idx / (stages.length - 1) : 0;
              const barColor =
                progressPercent < 0.33
                  ? "bg-blue-500"
                  : progressPercent < 0.66
                    ? "bg-yellow-500"
                    : "bg-green-500";

              return (
                <div
                  key={stage.id}
                  className="shrink-0 w-64 sm:w-70 flex flex-col"
                  onDragOver={(e) => {
                    if (!canEditDeals) return;
                    e.preventDefault();
                    e.currentTarget
                      .querySelector("[data-drop-zone]")
                      ?.classList.add("ring-2", "ring-foreground", "ring-inset");
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget
                      .querySelector("[data-drop-zone]")
                      ?.classList.remove("ring-2", "ring-foreground", "ring-inset");
                  }}
                  onDrop={(e) => {
                    if (!canEditDeals) return;
                    e.preventDefault();
                    e.currentTarget
                      .querySelector("[data-drop-zone]")
                      ?.classList.remove("ring-2", "ring-foreground", "ring-inset");
                    const dealId = e.dataTransfer.getData("dealId");
                    if (dealId) updateDealStage(dealId, stage.id);
                  }}
                >
                  {/* Stage header */}
                  <div className="mb-2">
                    <div className={`h-1 ${barColor} rounded-full mb-3`} />
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-foreground">
                          {stage.name}
                        </h3>
                        <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-bold tabular-nums">
                          {stageDeals.length}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] font-semibold text-muted-foreground px-1 mt-0.5 tabular-nums">
                      €{stageValue.toLocaleString("es-ES")}
                    </p>
                  </div>

                  {/* Cards container */}
                  <div
                    data-drop-zone
                    className="flex-1 space-y-2 bg-muted/40 rounded-2xl p-2 border border-border/30 transition-all overflow-y-auto"
                    style={{ maxHeight: "calc(100vh - 280px)" }}
                  >
                    {stageDeals.length === 0 ? (
                      <div className="flex items-center justify-center h-24 text-xs text-muted-foreground/50 font-medium">
                        Sin deals
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <div
                          key={deal.id}
                          draggable={canEditDeals}
                          onDragStart={
                            canEditDeals
                              ? (e) => e.dataTransfer.setData("dealId", deal.id)
                              : undefined
                          }
                          onClick={() => setEditingDeal(deal)}
                          className="bg-card border border-border/50 rounded-2xl p-3 shadow-sm cursor-pointer hover:border-foreground/20 hover:shadow-md transition-all group"
                        >
                          <h4 className="text-sm font-semibold truncate mb-2">
                            {deal.name}
                          </h4>

                          <div className="flex items-center gap-1.5 mb-2">
                            <DollarSign size={12} className="text-muted-foreground shrink-0" />
                            <span className="text-xs font-bold tabular-nums">
                              €{(deal.value || 0).toLocaleString("es-ES")}
                            </span>
                          </div>

                          <div className="space-y-1">
                            {getCompanyName(deal.company_id) && (
                              <div className="flex items-center gap-1.5">
                                <Building2 size={10} className="text-muted-foreground/50 shrink-0" />
                                <span className="text-[10px] text-muted-foreground truncate">
                                  {getCompanyName(deal.company_id)}
                                </span>
                              </div>
                            )}
                            {getContactName(deal.contact_id) && (
                              <div className="flex items-center gap-1.5">
                                <User size={10} className="text-muted-foreground/50 shrink-0" />
                                <span className="text-[10px] text-muted-foreground truncate">
                                  {getContactName(deal.contact_id)}
                                </span>
                              </div>
                            )}
                            {deal.expected_close_date && (
                              <div className="flex items-center gap-1.5">
                                <Calendar size={10} className="text-muted-foreground/50 shrink-0" />
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(
                                    deal.expected_close_date
                                  ).toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Quick add button */}
                  {canEditDeals && (
                  <button
                    onClick={() => setShowQuickCreate(stage.id)}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-2xl transition-colors"
                  >
                    <Plus size={12} />
                    Añadir deal
                  </button>
                  )}
                </div>
              );
            })}

            {/* Won / Lost columns */}
            <div className="shrink-0 w-50 flex flex-col gap-3">
              {/* Won */}
              <div
                className="flex-1 rounded-2xl border border-dashed border-green-200 bg-green-50/50 p-2"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add(
                    "ring-2",
                    "ring-green-500",
                    "ring-inset"
                  );
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove(
                    "ring-2",
                    "ring-green-500",
                    "ring-inset"
                  );
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove(
                    "ring-2",
                    "ring-green-500",
                    "ring-inset"
                  );
                  if (!canEditDeals) return;
                  const dealId = e.dataTransfer.getData("dealId");
                  if (dealId && currentTenant) {
                    dealsApi
                      .update(currentTenant.id, dealId, { status: "won" })
                      .then(load);
                  }
                }}
              >
                <div className="text-center mb-2">
                  <div className="h-1 bg-green-500 rounded-full mb-2" />
                  <h3 className="text-xs font-semibold text-green-600">
                    Ganado
                  </h3>
                  <p className="text-[10px] font-semibold text-green-500 mt-0.5 tabular-nums">
                    {allDeals.filter((d) => d.status === "won").length} deals
                  </p>
                </div>
                <div className="flex items-center justify-center h-16 text-xs text-green-300 font-medium">
                  Arrastrar aquí
                </div>
              </div>

              {/* Lost */}
              <div
                className="flex-1 rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-2"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add(
                    "ring-2",
                    "ring-red-500",
                    "ring-inset"
                  );
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove(
                    "ring-2",
                    "ring-red-500",
                    "ring-inset"
                  );
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove(
                    "ring-2",
                    "ring-red-500",
                    "ring-inset"
                  );
                  if (!canEditDeals) return;
                  const dealId = e.dataTransfer.getData("dealId");
                  if (dealId) {
                    const deal = allDeals.find((d) => d.id === dealId);
                    if (deal) {
                      setMarkingAsLost(deal);
                    }
                  }
                }}
              >
                <div className="text-center mb-2">
                  <div className="h-1 bg-red-500 rounded-full mb-2" />
                  <h3 className="text-xs font-semibold text-red-600">
                    Perdido
                  </h3>
                  <p className="text-[10px] font-semibold text-red-500 mt-0.5 tabular-nums">
                    {allDeals.filter((d) => d.status === "lost").length} deals
                  </p>
                </div>
                <div className="flex items-center justify-center h-16 text-xs text-red-300 font-medium">
                  Arrastrar aquí
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit deal modal */}
      {editingDeal && (
        <PipelineDealModal
          deal={editingDeal}
          stages={stages}
          companies={companies}
          contacts={contacts}
          onClose={() => setEditingDeal(null)}
          onSaved={load}
        />
      )}

      {/* Quick create modal */}
      {showQuickCreate && (
        <QuickCreateDeal
          stageId={showQuickCreate}
          stages={stages}
          companies={companies}
          contacts={contacts}
          onClose={() => setShowQuickCreate(null)}
          onCreated={load}
        />
      )}

      {/* Mark as lost modal */}
      {markingAsLost && (
        <MarkAsLostModal
          deal={markingAsLost}
          onClose={() => setMarkingAsLost(null)}
          onConfirmed={load}
        />
      )}
    </>
  );
}

/* ─── Pipeline Deal Edit Modal ──────────────────────────────── */

function PipelineDealModal({
  deal,
  stages,
  companies,
  contacts,
  onClose,
  onSaved,
}: {
  deal: Deal;
  stages: PipelineStage[];
  companies: Company[];
  contacts: Contact[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { currentTenant } = useAuthStore();
  const [name, setName] = useState(deal.name);
  const [value, setValue] = useState(String(deal.value || ""));
  const [stageId, setStageId] = useState(deal.stage_id || "");
  const [priority, setPriority] = useState<NonNullable<Deal["priority"]>>(deal.priority || "medium");
  const [status, setStatus] = useState(deal.status);
  const [lostReason, setLostReason] = useState(deal.lost_reason || "");
  const [companyId, setCompanyId] = useState(deal.company_id || "");
  const [contactId, setContactId] = useState(deal.contact_id || "");
  const [expectedClose, setExpectedClose] = useState(
    deal.expected_close_date ? deal.expected_close_date.split("T")[0] : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;
    if (status === "lost" && !lostReason.trim()) {
      setError("Indica una razón de pérdida.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        name,
        value: parseFloat(value) || 0,
        stage_id: stageId || null,
        priority,
        status,
        company_id: companyId || null,
        contact_id: contactId || null,
        expected_close_date: expectedClose || null,
      };
      if (status === "lost") body.lost_reason = lostReason;
      else body.lost_reason = null;

      await dealsApi.update(currentTenant.id, deal.id, body);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentTenant) return;
    if (!confirm("¿Eliminar este deal?")) return;
    await dealsApi.delete(currentTenant.id, deal.id);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border/50 rounded-3xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 sticky top-0 bg-card z-10 rounded-t-3xl">
          <h2 className="text-sm font-bold tracking-tight">
            Editar Deal
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 transition-colors"
            >
              Eliminar
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <FieldLabel label="Nombre *">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
            />
          </FieldLabel>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldLabel label="Valor (€)">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                min="0"
                step="0.01"
                className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
              />
            </FieldLabel>

            <FieldLabel label="Estado">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Deal["status"])}
                className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
              >
                <option value="open">Abierto</option>
                <option value="won">Ganado</option>
                <option value="lost">Perdido</option>
              </select>
            </FieldLabel>
          </div>

          <FieldLabel label="Prioridad">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as NonNullable<Deal["priority"]>)}
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </FieldLabel>

          {status === "lost" && (
            <FieldLabel label="Razón de pérdida *">
              <input
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                placeholder="¿Por qué se perdió?"
                className="w-full bg-red-50/50 border border-red-200/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 transition-colors"
              />
            </FieldLabel>
          )}

          <FieldLabel label="Etapa">
            <select
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
            >
              <option value="">— Ninguna —</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FieldLabel>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldLabel label="Empresa">
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
              >
                <option value="">— Ninguna —</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FieldLabel>

            <FieldLabel label="Contacto">
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
              >
                <option value="">— Ninguno —</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
            </FieldLabel>
          </div>

          <FieldLabel label="Fecha cierre esperada">
            <input
              type="date"
              value={expectedClose}
              onChange={(e) => setExpectedClose(e.target.value)}
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
            />
          </FieldLabel>

          {error && (
            <p className="text-xs text-red-600 font-medium">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border rounded-2xl py-2.5 text-xs font-semibold hover:border-foreground/30 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 bg-foreground text-background py-2.5 rounded-2xl text-xs font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Quick Create Deal ─────────────────────────────────────── */

function QuickCreateDeal({
  stageId,
  stages,
  companies,
  contacts,
  onClose,
  onCreated,
}: {
  stageId: string;
  stages: PipelineStage[];
  companies: Company[];
  contacts: Contact[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const { currentTenant } = useAuthStore();
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [priority, setPriority] = useState<NonNullable<Deal["priority"]>>("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const stageName =
    stages.find((s) => s.id === stageId)?.name || "esta etapa";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;
    setLoading(true);
    setError("");
    try {
      await dealsApi.create(currentTenant.id, {
        name,
        value: parseFloat(value) || 0,
        stage_id: stageId,
        company_id: companyId || undefined,
        priority,
        status: "open",
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al crear");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border/50 rounded-3xl shadow-lg w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 rounded-t-3xl">
          <div>
            <h2 className="text-sm font-bold tracking-tight">
              Nuevo Deal
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              En {stageName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FieldLabel label="Nombre *">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nombre del deal"
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
              autoFocus
            />
          </FieldLabel>

          <FieldLabel label="Valor (€)">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              min="0"
              step="0.01"
              placeholder="0"
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
            />
          </FieldLabel>

          <FieldLabel label="Empresa">
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
            >
              <option value="">— Ninguna —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
                ))}
            </select>
          </FieldLabel>

          <FieldLabel label="Prioridad">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as NonNullable<Deal["priority"]>)}
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </FieldLabel>

          {error && (
            <p className="text-xs text-red-600 font-medium">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border rounded-2xl py-2.5 text-xs font-semibold hover:border-foreground/30 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 bg-foreground text-background py-2.5 rounded-2xl text-xs font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Field Label ───────────────────────────────────────────── */

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─── Mark as Lost Modal ─────────────────────────────────────── */

function MarkAsLostModal({
  deal,
  onClose,
  onConfirmed,
}: {
  deal: Deal;
  onClose: () => void;
  onConfirmed: () => void;
}) {
  const { currentTenant } = useAuthStore();
  const [lostReason, setLostReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || !lostReason.trim()) {
      setError("Por favor indica un motivo de pérdida");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await dealsApi.update(currentTenant.id, deal.id, {
        status: "lost",
        lost_reason: lostReason,
      });
      onConfirmed();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al marcar como perdido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border/50 rounded-3xl shadow-lg w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 rounded-t-3xl">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-red-600">
              Marcar como Perdido
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {deal.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FieldLabel label="Motivo de la pérdida *">
            <textarea
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              required
              placeholder="¿Por qué se perdió este deal? (ej: Presupuesto insuficiente, Cambió de proveedor, Falta de interés, etc.)"
              className="w-full bg-red-50/50 border border-red-200/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 transition-colors resize-none h-24"
              autoFocus
            />
          </FieldLabel>

          {error && (
            <p className="text-xs text-red-600 font-medium">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border rounded-2xl py-2.5 text-xs font-semibold hover:border-foreground/30 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !lostReason.trim()}
              className="flex-1 bg-red-600 text-white py-2.5 rounded-2xl text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Marcar como Perdido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
