"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import {
  deals as dealsApi,
  companies as companiesApi,
  contacts as contactsApi,
  pipeline as pipelineApi,
  type Deal,
  type Company,
  type Contact,
  type PipelineStage,
  ApiError,
} from "@/lib/api";
import Header from "@/components/layout/Header";
import { useRole } from "@/lib/hooks/useRole";
import {
  Plus,
  DollarSign,
  X,
  Loader2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Pencil,
} from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  open: { label: "Abierto", color: "bg-blue-100 text-blue-700" },
  won: { label: "Ganado", color: "bg-green-100 text-green-700" },
  lost: { label: "Perdido", color: "bg-red-100 text-red-700" },
};

const PRIORITY_MAP: Record<NonNullable<Deal["priority"]>, { label: string; color: string; dot: string }> = {
  low:    { label: "Baja",  color: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  medium: { label: "Media", color: "bg-amber-100 text-amber-800", dot: "bg-amber-400" },
  high:   { label: "Alta",  color: "bg-rose-100 text-rose-700",   dot: "bg-rose-500"  },
};

export default function DealsPage() {
  const { currentTenant } = useAuthStore();
  const { canEditDeals, canDeleteDeals } = useRole();
  const [items, setItems] = useState<Deal[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = () => {
    if (!currentTenant) return;
    setLoading(true);
    Promise.all([
      dealsApi.list(currentTenant.id),
      companiesApi.list(currentTenant.id),
      contactsApi.list(currentTenant.id),
      pipelineApi.list(currentTenant.id),
    ])
      .then(([d, comp, cont, stg]) => {
        setItems(d.data);
        setCompanies(comp.data);
        setContacts(cont.data);
        setStages(stg.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [currentTenant]);

  const getName = <T extends { id: string; name?: string }>(
    list: T[],
    id?: string
  ) => list.find((i) => i.id === id)?.name || "—";

  const getContactName = (id?: string) => {
    const c = contacts.find((i) => i.id === id);
    return c ? `${c.first_name} ${c.last_name || ""}`.trim() : "—";
  };

  const filtered =
    statusFilter === "all"
      ? items
      : items.filter((d) => d.status === statusFilter);

  const totalValue = items.reduce((s, d) => s + (d.value || 0), 0);
  const openValue = items
    .filter((d) => d.status === "open")
    .reduce((s, d) => s + (d.value || 0), 0);

  return (
    <>
      <Header title="Deals">
        {canEditDeals && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-2xl text-xs font-semibold hover:bg-foreground/90 transition-colors shadow-sm"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">NUEVO DEAL</span>
            <span className="sm:hidden">NUEVO</span>
          </button>
        )}
      </Header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <SummaryCard
            label="Total Deals"
            value={items.length.toString()}
            icon={<DollarSign size={16} />}
          />
          <SummaryCard
            label="Valor Total"
            value={`€${totalValue.toLocaleString("es-ES")}`}
            icon={<TrendingUp size={16} />}
          />
          <SummaryCard
            label="Pipeline Abierto"
            value={`€${openValue.toLocaleString("es-ES")}`}
            icon={<TrendingDown size={16} />}
          />
          <SummaryCard
            label="Win Rate"
            value={`${items.length ? Math.round((items.filter((d) => d.status === "won").length / items.length) * 100) : 0}%`}
            icon={<TrendingUp size={16} />}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { key: "all", label: "Todos" },
            { key: "open", label: "Abiertos" },
            { key: "won", label: "Ganados" },
            { key: "lost", label: "Perdidos" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-2xl border transition-colors whitespace-nowrap ${
                statusFilter === f.key
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-card text-muted-foreground border-border/50 hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <DollarSign size={24} className="text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">Sin deals</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Crea tu primer deal para empezar.
            </p>
            {canEditDeals && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 bg-foreground text-background px-6 py-2.5 rounded-2xl text-sm font-semibold hover:bg-foreground/90 transition-colors shadow-sm"
              >
                Crear deal
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30 border-b border-border/30">
                <span className="col-span-3 text-xs font-medium text-muted-foreground">Nombre</span>
                <span className="col-span-2 text-xs font-medium text-muted-foreground">Empresa</span>
                <span className="col-span-2 text-xs font-medium text-muted-foreground">Contacto</span>
                <span className="col-span-1 text-xs font-medium text-muted-foreground">Etapa</span>
                <span className="col-span-2 text-xs font-medium text-muted-foreground text-right">Valor</span>
                <span className="col-span-1 text-xs font-medium text-muted-foreground">Estado</span>
                <span className="col-span-1" />
              </div>

              {filtered.map((deal) => {
                const st = STATUS_MAP[deal.status] || STATUS_MAP.open;
                const pr = deal.priority ? PRIORITY_MAP[deal.priority] : null;
                return (
                  <div
                    key={deal.id}
                    onClick={() => setSelectedDeal(deal)}
                    className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border/20 hover:bg-muted/20 transition-colors group items-center cursor-pointer"
                  >
                    <div className="col-span-3 flex items-center gap-2 min-w-0">
                      {pr && (
                        <span
                          title={pr.label}
                          className={`shrink-0 w-2.5 h-2.5 rounded-full ${pr.dot}`}
                        />
                      )}
                      <span className="text-sm font-semibold truncate">{deal.name}</span>
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground truncate">{getName(companies, deal.company_id)}</div>
                    <div className="col-span-2 text-xs text-muted-foreground truncate">{getContactName(deal.contact_id)}</div>
                    <div className="col-span-1 text-xs text-muted-foreground truncate">{getName(stages, deal.stage_id)}</div>
                    <div className="col-span-2 text-sm font-bold text-right">€{(deal.value || 0).toLocaleString("es-ES")}</div>
                    <div className="col-span-1">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${st.color}`}>{st.label}</span>
                    </div>
                    <div className="col-span-1 flex justify-end gap-1">
                      {canEditDeals && <button onClick={(e) => { e.stopPropagation(); setEditingDeal(deal); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"><Pencil size={14} /></button>}
                      {canDeleteDeals && <button onClick={(e) => { e.stopPropagation(); if (!currentTenant) return; dealsApi.delete(currentTenant.id, deal.id).then(load); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 transition-all"><Trash2 size={14} /></button>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((deal) => {
                const st = STATUS_MAP[deal.status] || STATUS_MAP.open;
                const pr = deal.priority ? PRIORITY_MAP[deal.priority] : null;
                return (
                  <div
                    key={deal.id}
                    onClick={() => setSelectedDeal(deal)}
                    className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {pr && (
                          <span
                            title={pr.label}
                            className={`shrink-0 w-2.5 h-2.5 rounded-full ${pr.dot}`}
                          />
                        )}
                        <span className="text-sm font-semibold truncate">{deal.name}</span>
                      </div>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${st.color}`}>{st.label}</span>
                    </div>
                    <p className="text-lg font-bold mb-2">€{(deal.value || 0).toLocaleString("es-ES")}</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Empresa: {getName(companies, deal.company_id)}</p>
                      <p>Contacto: {getContactName(deal.contact_id)}</p>
                      <p>Etapa: {getName(stages, deal.stage_id)}</p>
                    </div>
                    <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-border/20">
                      {canEditDeals && <button onClick={(e) => { e.stopPropagation(); setEditingDeal(deal); }} className="text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>}
                      {canDeleteDeals && <button onClick={(e) => { e.stopPropagation(); if (!currentTenant) return; dealsApi.delete(currentTenant.id, deal.id).then(load); }} className="text-muted-foreground hover:text-red-600"><Trash2 size={14} /></button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {showForm && (
        <DealForm
          tenantId={currentTenant?.id || ""}
          companies={companies}
          contacts={contacts}
          stages={stages}
          onClose={() => setShowForm(false)}
          onSaved={load}
        />
      )}

      {editingDeal && (
        <DealForm
          tenantId={currentTenant?.id || ""}
          deal={editingDeal}
          companies={companies}
          contacts={contacts}
          stages={stages}
          onClose={() => setEditingDeal(null)}
          onSaved={load}
        />
      )}

      {selectedDeal && (
        <DealDetails
          deal={selectedDeal}
          companies={companies}
          contacts={contacts}
          stages={stages}
          onClose={() => setSelectedDeal(null)}
          onEdit={() => {
            setEditingDeal(selectedDeal);
            setSelectedDeal(null);
          }}
        />
      )}
    </>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border/50 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground">{icon}</div>
      <p className="text-xs font-medium text-muted-foreground">
        {label}
      </p>
      <p className="text-xl font-bold tracking-tight mt-0.5">{value}</p>
    </div>
  );
}

function DealDetails({
  deal,
  companies,
  contacts,
  stages,
  onClose,
  onEdit,
}: {
  deal: Deal;
  companies: Company[];
  contacts: Contact[];
  stages: PipelineStage[];
  onClose: () => void;
  onEdit: () => void;
}) {
  const status = STATUS_MAP[deal.status] || STATUS_MAP.open;
  const priority = PRIORITY_MAP[deal.priority || "medium"];
  const companyName =
    companies.find((company) => company.id === deal.company_id)?.name || "—";
  const contact = contacts.find((item) => item.id === deal.contact_id);
  const contactName = contact
    ? `${contact.first_name} ${contact.last_name || ""}`.trim()
    : "—";
  const stageName =
    stages.find((stage) => stage.id === deal.stage_id)?.name || "—";
  const expectedCloseDate = deal.expected_close_date
    ? new Date(deal.expected_close_date).toLocaleDateString("es-ES")
    : "—";

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border/50 rounded-3xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 sticky top-0 bg-card z-10 rounded-t-3xl">
          <div>
            <h2 className="text-sm font-bold tracking-tight">Detalle del Deal</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Revisa la información antes de editar.
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Nombre</p>
              <h3 className="text-xl font-bold tracking-tight mt-1">{deal.name}</h3>
            </div>
            <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${status.color}`}>
              {status.label}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailField label="Empresa" value={companyName} />
            <DetailField label="Contacto" value={contactName} />
            <DetailField label="Etapa" value={stageName} />
            <DetailField label="Prioridad" value={priority.label} />
            <DetailField
              label="Valor"
              value={`€${(deal.value || 0).toLocaleString("es-ES")}`}
            />
            <DetailField label="Estado" value={status.label} />
            <DetailField
              label="Fecha de cierre esperada"
              value={expectedCloseDate}
            />
          </div>

          {deal.status === "lost" && deal.lost_reason && (
            <div className="rounded-2xl border border-red-200/60 bg-red-50/60 px-4 py-3">
              <p className="text-xs font-medium text-red-700">Razón de pérdida</p>
              <p className="text-sm text-red-900 mt-1">{deal.lost_reason}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border rounded-2xl py-2.5 text-xs font-semibold hover:border-foreground/30 transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 bg-foreground text-background py-2.5 rounded-2xl text-xs font-semibold hover:bg-foreground/90 transition-colors shadow-sm"
            >
              Editar deal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DealForm({
  tenantId,
  deal,
  companies,
  contacts,
  stages,
  onClose,
  onSaved,
}: {
  tenantId: string;
  deal?: Deal;
  companies: Company[];
  contacts: Contact[];
  stages: PipelineStage[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!deal;

  const [name, setName] = useState(deal?.name || "");
  const [companyId, setCompanyId] = useState(deal?.company_id || "");
  const [contactId, setContactId] = useState(deal?.contact_id || "");
  const [stageId, setStageId] = useState(deal?.stage_id || stages[0]?.id || "");
  const [value, setValue] = useState(deal ? String(deal.value || "") : "");
  const [priority, setPriority] = useState<NonNullable<Deal["priority"]>>(deal?.priority || "medium");
  const [status, setStatus] = useState<string>(deal?.status || "open");
  const [lostReason, setLostReason] = useState(deal?.lost_reason || "");
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    deal?.expected_close_date ? deal.expected_close_date.split("T")[0] : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (status === "lost" && !lostReason.trim()) {
      setError("Debes indicar una razón de pérdida cuando el estado es Perdido.");
      setLoading(false);
      return;
    }

    const body: Record<string, unknown> = {
      name,
      company_id: companyId || null,
      contact_id: contactId || null,
      stage_id: stageId || null,
      value: parseFloat(value) || 0,
      priority,
      status,
      expected_close_date: expectedCloseDate || null,
    };

    if (status === "lost") {
      body.lost_reason = lostReason;
    } else {
      body.lost_reason = null;
    }

    try {
      if (isEdit) {
        await dealsApi.update(tenantId, deal!.id, body);
      } else {
        await dealsApi.create(tenantId, body);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border/50 rounded-3xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 sticky top-0 bg-card z-10 rounded-t-3xl">
          <h2 className="text-sm font-bold tracking-tight">
            {isEdit ? "Editar Deal" : "Nuevo Deal"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField label="Nombre *">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
            />
          </FormField>

          <FormField label="Valor (€)">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              min="0"
              step="0.01"
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Estado">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
              >
                <option value="open">Abierto</option>
                <option value="won">Ganado</option>
                <option value="lost">Perdido</option>
              </select>
            </FormField>

            <FormField label="Prioridad">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as NonNullable<Deal["priority"]>)}
                className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Etapa">
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
            </FormField>
          </div>

          {status === "lost" && (
            <FormField label="Razón de pérdida *">
              <input
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                placeholder="¿Por qué se perdió este deal?"
                className="w-full bg-red-50/50 border border-red-200/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 transition-colors"
              />
            </FormField>
          )}

          <FormField label="Empresa">
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
          </FormField>

          <FormField label="Contacto">
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
          </FormField>

          <FormField label="Fecha cierre esperada">
            <input
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
            />
          </FormField>

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
              {isEdit ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-muted/30 border border-border/40 px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-1 overflow-wrap-anywhere">
        {value}
      </p>
    </div>
  );
}

function FormField({
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
