"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import {
  contacts as contactsApi,
  companies as companiesApi,
  deals as dealsApi,
  activities as activitiesApi,
  type Contact,
  type Company,
  type Deal,
  type Activity,
  ApiError,
} from "@/lib/api";
import Header from "@/components/layout/Header";
import { useRole } from "@/lib/hooks/useRole";
import {
  Plus,
  Users,
  Mail,
  Phone,
  X,
  Loader2,
  Trash2,
  Building2,
  Pencil,
  MapPin,
  DollarSign,
  CalendarCheck,
  PhoneCall,
  CalendarDays,
  CheckSquare,
  StickyNote,
  NotebookPen,
  Check,
  Briefcase,
} from "lucide-react";

export default function ContactsPage() {
  const { currentTenant } = useAuthStore();
  const { canEdit, canDelete } = useRole();
  const [items, setItems] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [detailContact, setDetailContact] = useState<Contact | null>(null);

  const load = () => {
    if (!currentTenant) return;
    setLoading(true);
    Promise.all([
      contactsApi.list(currentTenant.id),
      companiesApi.list(currentTenant.id),
    ])
      .then(([c, comp]) => {
        setItems(c.data);
        setCompanies(comp.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [currentTenant]);

  const getCompanyName = (id?: string) =>
    companies.find((c) => c.id === id)?.name || "—";

  const handleEdit = (contact: Contact) => {
    setEditing(contact);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleOpenDetail = (contact: Contact) => {
    setDetailContact(contact);
  };

  return (
    <>
      <Header title="Contactos">
        {canEdit && (
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-2xl text-xs font-semibold hover:bg-foreground/90 transition-colors shadow-sm"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">NUEVO CONTACTO</span>
            <span className="sm:hidden">NUEVO</span>
          </button>
        )}
      </Header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={24} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users size={24} className="text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              Sin contactos
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Añade tu primer contacto para empezar.
            </p>
            {canEdit && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 bg-foreground text-background px-6 py-2.5 rounded-2xl text-sm font-semibold hover:bg-foreground/90 transition-colors shadow-sm"
              >
                Crear contacto
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30 border-b border-border/30">
                <span className="col-span-3 text-xs font-medium text-muted-foreground">Nombre</span>
                <span className="col-span-3 text-xs font-medium text-muted-foreground">Email</span>
                <span className="col-span-2 text-xs font-medium text-muted-foreground">Teléfono</span>
                <span className="col-span-2 text-xs font-medium text-muted-foreground">Empresa</span>
                <span className="col-span-1 text-xs font-medium text-muted-foreground">Cargo</span>
                <span className="col-span-1" />
              </div>

              {items.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleOpenDetail(contact)}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border/20 hover:bg-muted/20 transition-colors group items-center cursor-pointer"
                >
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold shrink-0">
                      {contact.first_name?.[0]}{contact.last_name?.[0]}
                    </div>
                    <span className="text-sm font-semibold truncate">{contact.first_name} {contact.last_name}</span>
                  </div>
                  <div className="col-span-3 flex items-center gap-1 text-xs text-muted-foreground truncate">
                    {contact.email && <Mail size={11} className="shrink-0" />}
                    <span className="truncate">{contact.email || "—"}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1 text-xs text-muted-foreground">
                    {contact.phone && <Phone size={11} className="shrink-0" />}
                    <span>{contact.phone || "—"}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 size={11} className="shrink-0" />
                    <span className="truncate">{getCompanyName(contact.company_id)}</span>
                  </div>
                  <div className="col-span-1 text-xs text-muted-foreground truncate">{contact.job_title || "—"}</div>
                  <div className="col-span-1 flex justify-end gap-1">
                    {canEdit && <button onClick={(e) => { e.stopPropagation(); handleEdit(contact); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"><Pencil size={14} /></button>}
                    {canDelete && <button onClick={(e) => { e.stopPropagation(); if (!currentTenant) return; contactsApi.delete(currentTenant.id, contact.id).then(load); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 transition-all"><Trash2 size={14} /></button>}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {items.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleOpenDetail(contact)}
                  className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">
                      {contact.first_name?.[0]}{contact.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{contact.first_name} {contact.last_name}</p>
                      {contact.job_title && <p className="text-[10px] text-muted-foreground">{contact.job_title}</p>}
                    </div>
                    {canDelete && <button onClick={(e) => { e.stopPropagation(); if (!currentTenant) return; contactsApi.delete(currentTenant.id, contact.id).then(load); }} className="text-muted-foreground hover:text-red-600"><Trash2 size={14} /></button>}
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {contact.email && <div className="flex items-center gap-2"><Mail size={11} /><span className="truncate">{contact.email}</span></div>}
                    {contact.phone && <div className="flex items-center gap-2"><Phone size={11} /><span>{contact.phone}</span></div>}
                    <div className="flex items-center gap-2"><Building2 size={11} /><span>{getCompanyName(contact.company_id)}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showForm && (
        <ContactForm
          tenantId={currentTenant?.id || ""}
          companies={companies}
          editing={editing}
          onClose={handleClose}
          onSaved={load}
        />
      )}

      {detailContact && currentTenant && (
        <ContactDetailPanel
          contact={detailContact}
          tenantId={currentTenant.id}
          companies={companies}
          onClose={() => setDetailContact(null)}
          onEdit={() => {
            handleEdit(detailContact);
            setDetailContact(null);
          }}
          onDeleted={() => {
            setDetailContact(null);
            load();
          }}
          onNotesSaved={(updated) => setDetailContact(updated)}
        />
      )}
    </>
  );
}

// ─── Contact Detail Panel ──────────────────────────────────────────────────

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

function ContactDetailPanel({
  contact,
  tenantId,
  companies,
  onClose,
  onEdit,
  onDeleted,
  onNotesSaved,
}: {
  contact: Contact;
  tenantId: string;
  companies: Company[];
  onClose: () => void;
  onEdit: () => void;
  onDeleted: () => void;
  onNotesSaved: (updated: Contact) => void;
}) {
  const { canEdit, canDelete } = useRole();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activityList, setActivityList] = useState<Activity[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [notes, setNotes] = useState(contact.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [deletingContact, setDeletingContact] = useState(false);

  const company = companies.find((c) => c.id === contact.company_id);

  useEffect(() => {
    setNotes(contact.notes || "");
  }, [contact.id, contact.notes]);

  useEffect(() => {
    setLoadingDeals(true);
    setLoadingActivities(true);

    dealsApi
      .list(tenantId)
      .then((r) => setDeals(r.data.filter((d: Deal) => d.contact_id === contact.id)))
      .catch(() => {})
      .finally(() => setLoadingDeals(false));

    activitiesApi
      .list(tenantId)
      .then((r) =>
        setActivityList(r.data.filter((a: Activity) => a.contact_id === contact.id))
      )
      .catch(() => {})
      .finally(() => setLoadingActivities(false));
  }, [tenantId, contact.id]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const result = await contactsApi.update(tenantId, contact.id, { notes });
      onNotesSaved(result.data);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch {
      // silenciar error
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el contacto ${contact.first_name} ${contact.last_name ?? ""}?`)) return;
    setDeletingContact(true);
    try {
      await contactsApi.delete(tenantId, contact.id);
      onDeleted();
    } catch {
      setDeletingContact(false);
    }
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
            <div className="w-12 h-12 bg-foreground text-background rounded-2xl flex items-center justify-center text-base font-bold shrink-0">
              {contact.first_name[0]?.toUpperCase()}{contact.last_name?.[0]?.toUpperCase() ?? ""}
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight leading-tight">
                {contact.first_name} {contact.last_name ?? ""}
              </h2>
              {contact.job_title && (
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  {contact.job_title}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {canEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-muted/40 hover:bg-muted transition-colors border border-border/30"
              >
                <Pencil size={12} />
                Editar
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deletingContact}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200"
              >
                {deletingContact ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Eliminar
              </button>
            )}
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

          {/* ── Información ── */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Información
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {contact.email && (
                <InfoRow icon={<Mail size={13} />} label="Email">
                  <a href={`mailto:${contact.email}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                    {contact.email}
                  </a>
                </InfoRow>
              )}
              {contact.phone && (
                <InfoRow icon={<Phone size={13} />} label="Teléfono">
                  {contact.phone}
                </InfoRow>
              )}
              {contact.job_title && (
                <InfoRow icon={<Briefcase size={13} />} label="Cargo">
                  {contact.job_title}
                </InfoRow>
              )}
              {company && (
                <InfoRow icon={<Building2 size={13} />} label="Empresa">
                  {company.name}
                  {company.industry ? (
                    <span className="text-muted-foreground"> · {company.industry}</span>
                  ) : null}
                </InfoRow>
              )}
              {company?.country && (
                <InfoRow icon={<MapPin size={13} />} label="País">
                  {company.country}
                </InfoRow>
              )}
            </div>
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
                No hay deals asociados a este contacto.
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
                No hay actividades asociadas a este contacto.
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
              placeholder="Escribe aquí tus notas sobre este contacto…"
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

function ContactForm({
  tenantId,
  companies,
  editing,
  onClose,
  onSaved,
}: {
  tenantId: string;
  companies: Company[];
  editing: Contact | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!editing;
  const [firstName, setFirstName] = useState(editing?.first_name || "");
  const [lastName, setLastName] = useState(editing?.last_name || "");
  const [email, setEmail] = useState(editing?.email || "");
  const [phone, setPhone] = useState(editing?.phone || "");
  const [jobTitle, setJobTitle] = useState(editing?.job_title || "");
  const [companyId, setCompanyId] = useState(editing?.company_id || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = {
        first_name: firstName,
        last_name: lastName,
        email: email || undefined,
        phone: phone || undefined,
        job_title: jobTitle || undefined,
        company_id: companyId || undefined,
      };
      if (isEdit) {
        await contactsApi.update(tenantId, editing!.id, body);
      } else {
        await contactsApi.create(tenantId, body);
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
      <div className="bg-card border border-border/50 rounded-3xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 rounded-t-3xl">
          <h2 className="text-sm font-bold tracking-tight">
            {isEdit ? "Editar Contacto" : "Nuevo Contacto"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Nombre *
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Apellido *
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Teléfono
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Cargo
            </label>
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Empresa
            </label>
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
          </div>

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
              disabled={loading || !firstName.trim() || !lastName.trim()}
              className="flex-1 bg-foreground text-background py-2.5 rounded-2xl text-xs font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
