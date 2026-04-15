"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import {
  companies as companiesApi,
  contacts as contactsApi,
  deals as dealsApi,
  activities as activitiesApi,
  type Company,
  type Deal,
  type Contact,
  type Activity,
  ApiError,
} from "@/lib/api";
import Header from "@/components/layout/Header";
import { useRole } from "@/lib/hooks/useRole";
import {
  Plus,
  Building2,
  Mail,
  Phone,
  Globe,
  X,
  Loader2,
  Trash2,
  Pencil,
  User,
  MapPin,
  FileText,
  DollarSign,
  ChevronRight,
  NotebookPen,
  Check,
  Users,
  CalendarCheck,
  PhoneCall,
  CalendarDays,
  CheckSquare,
  StickyNote,
} from "lucide-react";

export default function CompaniesPage() {
  const { currentTenant } = useAuthStore();
  const { canEdit, canDelete } = useRole();
  const [items, setItems] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [detailCompany, setDetailCompany] = useState<Company | null>(null);

  const load = useCallback(() => {
    if (!currentTenant) return;

    setLoading(true);

    companiesApi
      .list(currentTenant.id)
      .then((r) => setItems(r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [currentTenant]);

  useEffect(() => {
    load();
  }, [load]);
  const handleEdit = (company: Company) => {
    setEditing(company);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleOpenDetail = (company: Company) => {
    setDetailCompany(company);
  };

  return (
    <>
      <Header title="Empresas">
        {canEdit && (
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-2xl text-xs font-semibold hover:bg-foreground/90 transition-colors shadow-sm"
          >
            <Plus size={14} />
            <span>NUEVA EMPRESA</span>
          </button>
        )}
      </Header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={24} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState onAdd={canEdit ? () => setShowForm(true) : undefined} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {items.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onView={() => handleOpenDetail(company)}
                onEdit={canEdit ? () => handleEdit(company) : undefined}
                onDelete={canDelete ? () => {
                  if (!currentTenant) return;
                  companiesApi.delete(currentTenant.id, company.id).then(load);
                } : undefined}
              />
            ))}

            {canEdit && (
              <button
                onClick={() => { setEditing(null); setShowForm(true); }}
                className="bg-muted/30 border-2 border-dashed border-border/50 rounded-3xl flex flex-col items-center justify-center p-6 hover:border-foreground/30 hover:bg-card transition-all group min-h-50"
              >
                <div className="w-12 h-12 rounded-full bg-card border border-border/50 flex items-center justify-center mb-4 group-hover:bg-foreground group-hover:text-background transition-colors shadow-sm">
                  <Plus size={24} />
                </div>
                <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">
                  Añadir empresa
                </p>
              </button>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <CompanyForm
          tenantId={currentTenant?.id || ""}
          editing={editing}
          onClose={handleClose}
          onSaved={load}
        />
      )}

      {detailCompany && (
        <CompanyDetailPanel
          company={detailCompany}
          tenantId={currentTenant?.id || ""}
          onClose={() => setDetailCompany(null)}
          onEdit={() => {
            handleEdit(detailCompany);
            setDetailCompany(null);
          }}
          onDeleted={() => {
            setDetailCompany(null);
            load();
          }}
          onNotesSaved={(updated: Company) => {
            setDetailCompany(updated);
            setItems((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          }}
        />
      )}
    </>
  );
}

function CompanyCard({
  company,
  onView,
  onEdit,
  onDelete,
}: {
  company: Company;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      onClick={onView}
      className="bg-card border border-border/50 rounded-3xl shadow-sm hover:shadow-md hover:border-foreground/20 transition-all group p-5 sm:p-6 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-2xl flex items-center justify-center text-sm font-bold border border-border/30">
            {company.name[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">{company.name}</h3>
            {company.industry && (
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                {company.industry}
              </p>
            )}
          </div>
        </div>
        <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors mt-0.5" />
      </div>

      <div className="space-y-2 mb-4">
        {company.contact_name && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User size={12} className="text-muted-foreground/60" />
            <span className="truncate">
              {company.contact_name}
              {company.contact_role ? ` · ${company.contact_role}` : ""}
            </span>
          </div>
        )}
        {company.email && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail size={12} className="text-muted-foreground/60" />
            <span className="truncate">{company.email}</span>
          </div>
        )}
        {company.phone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone size={12} className="text-muted-foreground/60" />
            <span>{company.phone}</span>
          </div>
        )}
        {company.website && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe size={12} className="text-muted-foreground/60" />
            <span className="truncate">{company.website}</span>
          </div>
        )}
        {company.country && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin size={12} className="text-muted-foreground/60" />
            <span className="truncate">{company.country}</span>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border/30 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/50">
          {new Date(company.created_at).toLocaleDateString("es-ES")}
        </span>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"
            >
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 transition-all"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Building2 size={24} className="text-muted-foreground" />
      </div>
      <h2 className="text-lg font-bold tracking-tight">Sin empresas</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Añade tu primera empresa para empezar a gestionar tus clientes.
      </p>
      {onAdd && (
        <button
          onClick={onAdd}
          className="mt-6 bg-foreground text-background px-6 py-2.5 rounded-2xl text-sm font-semibold hover:bg-foreground/90 transition-colors shadow-sm"
        >
          Crear empresa
        </button>
      )}
    </div>
  );
}

function CompanyForm({
  tenantId,
  editing,
  onClose,
  onSaved,
}: {
  tenantId: string;
  editing: Company | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!editing;

  const [name, setName] = useState(editing?.name || "");
  const [nif, setNif] = useState(editing?.nif || "");
  const [industry, setIndustry] = useState(editing?.industry || "");
  const [domain, setDomain] = useState(editing?.domain || "");
  const [country, setCountry] = useState(editing?.country || "");
  const [contactName, setContactName] = useState(editing?.contact_name || "");
  const [contactRole, setContactRole] = useState(editing?.contact_role || "");
  const [email, setEmail] = useState(editing?.email || "");
  const [phone, setPhone] = useState(editing?.phone || "");
  const [website, setWebsite] = useState(editing?.website || "");
  const [demoPreference, setDemoPreference] = useState(editing?.demo_preference || "");
  const [privacyAccepted, setPrivacyAccepted] = useState(editing?.privacy_accepted || false);
  const [marketingAccepted, setMarketingAccepted] = useState(editing?.marketing_accepted || false);
  const [notes, setNotes] = useState(editing?.notes || "");
  const [createContact, setCreateContact] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body: Partial<Company> = {
      name,
      nif: nif || undefined,
      industry: industry || undefined,
      domain: domain || undefined,
      country: country || undefined,
      contact_name: contactName || undefined,
      contact_role: contactRole || undefined,
      email: email || undefined,
      phone: phone || undefined,
      website: website || undefined,
      demo_preference: demoPreference || undefined,
      privacy_accepted: privacyAccepted,
      marketing_accepted: marketingAccepted,
      notes: notes || undefined,
    };

    try {
      if (isEdit) {
        await companiesApi.update(tenantId, editing!.id, body);
      } else {
        const result = await companiesApi.create(tenantId, body);

        // Auto-crear contacto vinculado si se marcó y hay nombre
        if (createContact && contactName.trim()) {
          const parts = contactName.trim().split(/\s+/);
          const firstName = parts[0];
          const lastName = parts.slice(1).join(" ") || undefined;
          await contactsApi.create(tenantId, {
            first_name: firstName,
            last_name: lastName,
            email: email || undefined,
            phone: phone || undefined,
            job_title: contactRole || undefined,
            company_id: result.data.id,
          });
        }
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
      <div className="bg-card border border-border/50 rounded-3xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 sticky top-0 bg-card z-10 rounded-t-3xl">
          <h2 className="text-sm font-bold">
            {isEdit ? "Editar Empresa" : "Nueva Empresa"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ── Datos Básicos ── */}
          <fieldset>
            <legend className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Building2 size={12} /> Datos de la Empresa
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre *" value={name} onChange={setName} required />
              <Field label="NIF / CIF" value={nif} onChange={setNif} />
              <Field label="Industria" value={industry} onChange={setIndustry} />
              <Field label="Dominio" value={domain} onChange={setDomain} />
              <Field label="País" value={country} onChange={setCountry} />
              <Field label="Website" value={website} onChange={setWebsite} />
            </div>
          </fieldset>

          {/* ── Contacto Principal ── */}
          <fieldset>
            <legend className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <User size={12} /> Contacto Principal
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre del contacto" value={contactName} onChange={setContactName} />
              <Field label="Cargo / Rol" value={contactRole} onChange={setContactRole} />
              <Field label="Email" value={email} onChange={setEmail} type="email" />
              <Field label="Teléfono" value={phone} onChange={setPhone} />
            </div>
            {!isEdit && contactName.trim() && (
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createContact}
                  onChange={(e) => setCreateContact(e.target.checked)}
                  className="accent-black w-4 h-4"
                />
                <span className="text-xs text-muted-foreground">
                  Crear también como <span className="font-bold">contacto</span> vinculado a esta empresa
                </span>
              </label>
            )}
          </fieldset>

          {/* ── Preferencias ── */}
          <fieldset>
            <legend className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <FileText size={12} /> Preferencias
            </legend>
            <div className="space-y-3">
              <Field label="Preferencia de demo" value={demoPreference} onChange={setDemoPreference} />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="accent-black w-4 h-4"
                />
                <span className="text-xs text-muted-foreground">Privacidad aceptada</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingAccepted}
                  onChange={(e) => setMarketingAccepted(e.target.checked)}
                  className="accent-black w-4 h-4"
                />
                <span className="text-xs text-muted-foreground">Marketing aceptado</span>
              </label>
            </div>
          </fieldset>

          {/* ── Notas ── */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-foreground/30 transition-all resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border py-2.5 rounded-2xl text-xs font-semibold hover:border-foreground/30 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 bg-foreground text-background py-2.5 rounded-2xl text-xs font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear empresa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/30 transition-all placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Company Detail Panel — slide-over lateral
───────────────────────────────────────────── */
function CompanyDetailPanel({
  company,
  tenantId,
  onClose,
  onEdit,
  onNotesSaved,
}: {
  company: Company;
  tenantId: string;
  onClose: () => void;
  onEdit: () => void;
  onDeleted: () => void;
  onNotesSaved: (updated: Company) => void;
}) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activityList, setActivityList] = useState<Activity[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [notes, setNotes] = useState(company.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    setNotes(company.notes || "");
  }, [company.id, company.notes]);

  useEffect(() => {
    setLoadingDeals(true);
    setLoadingContacts(true);
    setLoadingActivities(true);

    dealsApi
      .list(tenantId)
      .then((r) => setDeals(r.data.filter((d: Deal) => d.company_id === company.id)))
      .catch(() => {})
      .finally(() => setLoadingDeals(false));

    contactsApi
      .list(tenantId)
      .then((r) => setContacts(r.data.filter((c: Contact) => c.company_id === company.id)))
      .catch(() => {})
      .finally(() => setLoadingContacts(false));

    activitiesApi
      .list(tenantId)
      .then((r) =>
        setActivityList(r.data.filter((a: Activity) => a.company_id === company.id))
      )
      .catch(() => {})
      .finally(() => setLoadingActivities(false));
  }, [tenantId, company.id]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const result = await companiesApi.update(tenantId, company.id, { notes });
      onNotesSaved(result.data);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch {
      // silenciar error
    } finally {
      setSavingNotes(false);
    }
  };

  const STATUS_STYLES: Record<string, string> = {
    open: "bg-blue-100 text-blue-700",
    won: "bg-green-100 text-green-700",
    lost: "bg-red-100 text-red-700",
  };
  const STATUS_LABELS: Record<string, string> = {
    open: "Abierto",
    won: "Ganado",
    lost: "Perdido",
  };

  const ACTIVITY_ICON: Record<string, React.ReactNode> = {
    note: <StickyNote size={12} />,
    call: <PhoneCall size={12} />,
    meeting: <CalendarDays size={12} />,
    task: <CheckSquare size={12} />,
  };
  const ACTIVITY_LABEL: Record<string, string> = {
    note: "Nota",
    call: "Llamada",
    meeting: "Reunión",
    task: "Tarea",
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg z-50 bg-card shadow-2xl rounded-l-3xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-lg font-bold border border-border/30">
              {company.name[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight leading-tight">
                {company.name}
              </h2>
              {company.industry && (
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  {company.industry}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-muted/40 hover:bg-muted transition-colors border border-border/30"
            >
              <Pencil size={12} />
              Editar
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── Info ── */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Información
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {company.contact_name && (
                <InfoRow icon={<User size={13} />} label="Contacto principal">
                  {company.contact_name}
                  {company.contact_role ? (
                    <span className="text-muted-foreground"> · {company.contact_role}</span>
                  ) : null}
                </InfoRow>
              )}
              {company.email && (
                <InfoRow icon={<Mail size={13} />} label="Email">
                  <a href={`mailto:${company.email}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                    {company.email}
                  </a>
                </InfoRow>
              )}
              {company.phone && (
                <InfoRow icon={<Phone size={13} />} label="Teléfono">
                  {company.phone}
                </InfoRow>
              )}
              {company.website && (
                <InfoRow icon={<Globe size={13} />} label="Web">
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline" onClick={(e) => e.stopPropagation()}>
                    {company.website}
                  </a>
                </InfoRow>
              )}
              {company.country && (
                <InfoRow icon={<MapPin size={13} />} label="País">
                  {company.country}
                </InfoRow>
              )}
              {company.nif && (
                <InfoRow icon={<FileText size={13} />} label="NIF">
                  {company.nif}
                </InfoRow>
              )}
              {company.domain && (
                <InfoRow icon={<Globe size={13} />} label="Dominio">
                  {company.domain}
                </InfoRow>
              )}
            </div>
          </section>

          {/* ── Contactos ── */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <Users size={13} />
              Contactos
              {!loadingContacts && (
                <span className="bg-muted text-muted-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {contacts.length}
                </span>
              )}
            </h3>

            {loadingContacts ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-3">
                <Loader2 size={14} className="animate-spin" />
                Cargando contactos…
              </div>
            ) : contacts.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3">
                No hay contactos asociados a esta empresa.
              </p>
            ) : (
              <div className="space-y-2">
                {contacts.map((ct) => (
                  <div key={ct.id} className="flex items-center gap-3 p-3 bg-muted/20 border border-border/30 rounded-2xl">
                    <div className="w-7 h-7 bg-muted rounded-xl flex items-center justify-center text-[11px] font-bold border border-border/20 shrink-0">
                      {ct.first_name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-tight truncate">
                        {ct.first_name} {ct.last_name ?? ""}
                      </p>
                      {ct.job_title && (
                        <p className="text-[10px] text-muted-foreground truncate">{ct.job_title}</p>
                      )}
                    </div>
                    <div className="ml-auto shrink-0 text-right">
                      {ct.email && (
                        <p className="text-[10px] text-muted-foreground truncate max-w-30">{ct.email}</p>
                      )}
                      {ct.phone && (
                        <p className="text-[10px] text-muted-foreground">{ct.phone}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Deals ── */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <DollarSign size={13} />
              Deals
              {!loadingDeals && (
                <span className="bg-muted text-muted-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {deals.length}
                </span>
              )}
            </h3>

            {loadingDeals ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-3">
                <Loader2 size={14} className="animate-spin" />
                Cargando deals…
              </div>
            ) : deals.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3">
                No hay deals asociados a esta empresa.
              </p>
            ) : (
              <div className="space-y-2">
                {deals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-3 bg-muted/20 border border-border/30 rounded-2xl">
                    <div>
                      <p className="text-sm font-semibold leading-tight">{deal.name}</p>
                      {deal.expected_close_date && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Cierre: {new Date(deal.expected_close_date).toLocaleDateString("es-ES")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {deal.value != null && (
                        <span className="text-xs font-bold">
                          {Number(deal.value).toLocaleString("es-ES", {
                            style: "currency",
                            currency: "EUR",
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      )}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[deal.status] ?? "bg-muted text-muted-foreground"}`}>
                        {STATUS_LABELS[deal.status] ?? deal.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Actividades ── */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <CalendarCheck size={13} />
              Actividades
              {!loadingActivities && (
                <span className="bg-muted text-muted-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {activityList.length}
                </span>
              )}
            </h3>

            {loadingActivities ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-3">
                <Loader2 size={14} className="animate-spin" />
                Cargando actividades…
              </div>
            ) : activityList.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3">
                No hay actividades asociadas a esta empresa.
              </p>
            ) : (
              <div className="space-y-2">
                {activityList.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 p-3 bg-muted/20 border border-border/30 rounded-2xl">
                    <div className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${act.completed ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
                      {ACTIVITY_ICON[act.type] ?? <CalendarCheck size={12} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold leading-tight truncate">
                          {act.title || ACTIVITY_LABEL[act.type] || act.type}
                        </p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${act.completed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {act.completed ? "Completada" : "Pendiente"}
                        </span>
                      </div>
                      {act.description && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                          {act.description}
                        </p>
                      )}
                      {act.due_date && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Fecha: {new Date(act.due_date).toLocaleDateString("es-ES")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Notas ── */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <NotebookPen size={13} />
              Notas internas
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Escribe aquí tus notas sobre esta empresa…"
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-foreground/30 transition-all placeholder:text-muted-foreground/50 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="flex items-center gap-1.5 bg-foreground text-background text-xs font-semibold px-4 py-2 rounded-xl hover:bg-foreground/90 transition-colors disabled:opacity-60"
              >
                {savingNotes ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : notesSaved ? (
                  <Check size={13} />
                ) : (
                  <NotebookPen size={13} />
                )}
                {notesSaved ? "¡Guardado!" : "Guardar nota"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-2.5 bg-muted/20 rounded-2xl">
      <span className="text-muted-foreground/60 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-xs font-medium text-foreground leading-relaxed wrap-break-word">
          {children}
        </p>
      </div>
    </div>
  );
}
