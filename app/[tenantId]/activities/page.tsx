"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/lib/store";
import {
  activities as activitiesApi,
  activityComments as activityCommentsApi,
  activityTags as activityTagsApi,
  companies as companiesApi,
  contacts as contactsApi,
  deals as dealsApi,
  type Activity,
  type ActivityDetail,
  type ActivityTag,
  type Company,
  type Contact,
  type Deal,
  ApiError,
} from "@/lib/api";
import Header from "@/components/layout/Header";
import {
  Plus,
  Calendar,
  Phone,
  MessageSquare,
  ClipboardList,
  CheckCircle2,
  Circle,
  X,
  Loader2,
  Trash2,
  Clock,
  Building2,
  User,
  Tag,
  Pencil,
  Save,
  Link2,
} from "lucide-react";

const TYPE_CONFIG: Record<
  Activity["type"],
  { icon: React.ReactNode; label: string; color: string }
> = {
  call: {
    icon: <Phone size={14} />,
    label: "Llamada",
    color: "bg-blue-100 text-blue-600",
  },
  meeting: {
    icon: <Calendar size={14} />,
    label: "Reunión",
    color: "bg-green-100 text-green-600",
  },
  note: {
    icon: <MessageSquare size={14} />,
    label: "Nota",
    color: "bg-yellow-100 text-yellow-700",
  },
  task: {
    icon: <ClipboardList size={14} />,
    label: "Tarea",
    color: "bg-orange-100 text-orange-600",
  },
};

const TAG_COLORS = [
  "#808080",
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
];

export default function ActivitiesPage() {
  const { currentTenant, user } = useAuthStore();
  const [items, setItems] = useState<Activity[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [allTags, setAllTags] = useState<ActivityTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );
  const [selectedActivity, setSelectedActivity] = useState<ActivityDetail | null>(
    null
  );
  const [detailLoading, setDetailLoading] = useState(false);

  // Ref para poder llamar load() desde callbacks sin recrear funciones
  const currentTenantRef = useRef(currentTenant);
  useEffect(() => { currentTenantRef.current = currentTenant; }, [currentTenant]);

  const load = useCallback(() => {
    const tenant = currentTenantRef.current;
    if (!tenant) return;
    setLoading(true);
    Promise.all([
      activitiesApi.list(tenant.id),
      companiesApi.list(tenant.id),
      contactsApi.list(tenant.id),
      dealsApi.list(tenant.id),
      activityTagsApi.list(tenant.id),
    ])
      .then(([a, c, co, d, t]) => {
        setItems(a.data);
        setCompanies(c.data);
        setAllContacts(co.data);
        setDeals(d.data);
        setAllTags(t.data);
      })
      .catch((err) => console.error("[Activities] load error:", err))
      .finally(() => setLoading(false));
  }, []); // estable — lee currentTenant via ref

  const loadActivityDetail = useCallback(async (activityId: string) => {
    const tenant = currentTenantRef.current;
    if (!tenant) return;
    setDetailLoading(true);
    try {
      const { data } = await activitiesApi.getDetail(tenant.id, activityId);
      setSelectedActivity(data);
    } catch {
      setSelectedActivity(null);
    } finally {
      setDetailLoading(false);
    }
  }, []); // estable — lee currentTenant via ref

  // Dispara load cada vez que currentTenant cambia (incluyendo cuando pasa de null a valor)
  useEffect(() => {
    if (currentTenant) load();
  }, [currentTenant, load]);

  useEffect(() => {
    if (!selectedActivityId) {
      setSelectedActivity(null);
      return;
    }
    loadActivityDetail(selectedActivityId);
  }, [selectedActivityId, loadActivityDetail]);

  const toggleDone = async (activity: Activity) => {
    const tenant = currentTenantRef.current;
    if (!tenant) return;
    try {
      await activitiesApi.update(tenant.id, activity.id, {
        completed: !activity.completed,
      });
      load();
      if (selectedActivityId === activity.id) {
        loadActivityDetail(activity.id);
      }
    } catch {}
  };

  const removeActivity = async (activityId: string) => {
    const tenant = currentTenantRef.current;
    if (!tenant) return;
    try {
      await activitiesApi.delete(tenant.id, activityId);
      if (selectedActivityId === activityId) {
        setSelectedActivityId(null);
      }
      load();
    } catch {}
  };

  const filtered =
    filter === "all"
      ? items
      : filter === "done"
        ? items.filter((a) => a.completed)
        : filter === "pending"
          ? items.filter((a) => !a.completed)
          : items.filter((a) => a.type === filter);

  return (
    <>
      <Header title="Actividades">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-2xl text-xs font-semibold hover:bg-foreground/90 transition-colors shadow-sm"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">NUEVA ACTIVIDAD</span>
          <span className="sm:hidden">NUEVA</span>
        </button>
      </Header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { key: "all", label: "Todas" },
            { key: "pending", label: "Pendientes" },
            { key: "done", label: "Completadas" },
            ...Object.entries(TYPE_CONFIG).map(([key, cfg]) => ({
              key,
              label: cfg.label,
            })),
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-2xl border transition-colors whitespace-nowrap ${
                filter === f.key
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
              <ClipboardList size={24} className="text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              Sin actividades
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Crea tu primera actividad para empezar.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-6 bg-foreground text-background px-6 py-2.5 rounded-2xl text-sm font-semibold hover:bg-foreground/90 transition-colors shadow-sm"
            >
              Crear actividad
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((activity) => {
              const cfg = TYPE_CONFIG[activity.type] || TYPE_CONFIG.note;
              const companyName =
                companies.find((c) => c.id === activity.company_id)?.name ||
                "Empresa";
              const contact = allContacts.find(
                (c) => c.id === activity.contact_id
              );
              const deal = deals.find((item) => item.id === activity.deal_id);

              return (
                <div
                  key={activity.id}
                  onClick={() => setSelectedActivityId(activity.id)}
                  className={`bg-card border border-border/50 rounded-2xl shadow-sm p-4 flex items-start gap-3 sm:gap-4 hover:shadow-md hover:border-foreground/20 transition-all group cursor-pointer ${
                    activity.completed ? "opacity-60" : ""
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDone(activity);
                    }}
                    className="mt-0.5 shrink-0"
                  >
                    {activity.completed ? (
                      <CheckCircle2
                        size={20}
                        className="text-green-500"
                        fill="currentColor"
                        strokeWidth={0}
                      />
                    ) : (
                      <Circle
                        size={20}
                        className="text-muted-foreground/40 hover:text-foreground transition-colors"
                      />
                    )}
                  </button>

                  <div
                    className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${cfg.color} hidden sm:flex`}
                  >
                    {cfg.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold ${activity.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {activity.title || "Sin título"}
                    </p>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                      {activity.company_id && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Building2 size={10} />
                          {companyName}
                        </span>
                      )}
                      {activity.contact_id && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <User size={10} />
                          {contact
                            ? `${contact.first_name} ${contact.last_name || ""}`.trim()
                            : "Contacto"}
                        </span>
                      )}
                      {activity.deal_id && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Link2 size={10} />
                          {deal?.name || "Deal"}
                        </span>
                      )}
                      {activity.due_date && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock size={10} />
                          {formatDate(activity.due_date)}
                        </span>
                      )}
                      {activity.tags && activity.tags.length > 0 &&
                        activity.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: (tag.color ?? "#6366f1") + "25",
                              color: tag.color ?? "#6366f1",
                            }}
                          >
                            <Tag size={8} />
                            {tag.name}
                          </span>
                        ))}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeActivity(activity.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 transition-all shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && currentTenant && (
        <ActivityForm
          tenantId={currentTenant.id}
          onClose={() => setShowForm(false)}
          onCreated={load}
        />
      )}

      {selectedActivityId && currentTenant && (
        <ActivityDetailModal
          tenantId={currentTenant.id}
          currentUserId={user?.id}
          currentUserName={user?.full_name}
          activity={selectedActivity}
          allTags={allTags}
          loading={detailLoading}
          onClose={() => setSelectedActivityId(null)}
          onReload={() => {
            load();
            if (selectedActivityId) loadActivityDetail(selectedActivityId);
          }}
          onTagsReload={async () => {
            const tenant = currentTenantRef.current;
            if (!tenant) return;
            const { data } = await activityTagsApi.list(tenant.id);
            setAllTags(data);
          }}
        />
      )}
    </>
  );
}

function ActivityDetailModal({
  tenantId,
  currentUserId,
  currentUserName,
  activity,
  allTags,
  loading,
  onClose,
  onReload,
  onTagsReload,
}: {
  tenantId: string;
  currentUserId?: string;
  currentUserName?: string;
  activity: ActivityDetail | null;
  allTags: ActivityTag[];
  loading: boolean;
  onClose: () => void;
  onReload: () => void;
  onTagsReload: () => Promise<void>;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [savingField, setSavingField] = useState<"title" | "description" | null>(
    null
  );
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [tagIdToAssign, setTagIdToAssign] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);

  useEffect(() => {
    setTitleDraft(activity?.title || "");
    setDescriptionDraft(activity?.description || "");
    setEditingTitle(false);
    setEditingDescription(false);
    setEditingCommentId(null);
    setCommentDraft("");
    setNewComment("");
  }, [activity]);

  const saveField = async (field: "title" | "description") => {
    if (!activity) return;
    setSavingField(field);
    try {
      await activitiesApi.update(tenantId, activity.id, {
        [field]: field === "title" ? titleDraft.trim() : descriptionDraft.trim(),
      });
      onReload();
      if (field === "title") setEditingTitle(false);
      if (field === "description") setEditingDescription(false);
    } finally {
      setSavingField(null);
    }
  };

  const addComment = async () => {
    if (!activity || !newComment.trim()) return;
    setCommentLoading(true);
    try {
      await activityCommentsApi.create(tenantId, activity.id, newComment.trim());
      setNewComment("");
      onReload();
    } finally {
      setCommentLoading(false);
    }
  };

  const saveComment = async (commentId: string) => {
    if (!activity || !commentDraft.trim()) return;
    setCommentLoading(true);
    try {
      await activityCommentsApi.update(
        tenantId,
        activity.id,
        commentId,
        commentDraft.trim()
      );
      setEditingCommentId(null);
      setCommentDraft("");
      onReload();
    } finally {
      setCommentLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!activity) return;
    setCommentLoading(true);
    try {
      await activityCommentsApi.delete(tenantId, activity.id, commentId);
      onReload();
    } finally {
      setCommentLoading(false);
    }
  };

  const addTag = async () => {
    if (!activity || !tagIdToAssign) return;
    try {
      await activityTagsApi.addToActivity(tenantId, activity.id, tagIdToAssign);
      setTagIdToAssign("");
      onReload();
    } catch {}
  };

  const removeTag = async (tagId: string) => {
    if (!activity) return;
    try {
      await activityTagsApi.removeFromActivity(tenantId, activity.id, tagId);
      onReload();
    } catch {}
  };

  const createTag = async () => {
    if (!activity || !newTagName.trim()) return;
    setCreatingTag(true);
    try {
      const { data } = await activityTagsApi.create(
        tenantId,
        newTagName.trim(),
        newTagColor
      );
      await onTagsReload();
      await activityTagsApi.addToActivity(tenantId, activity.id, data.id);
      setNewTagName("");
      setNewTagColor(TAG_COLORS[0]);
      onReload();
    } finally {
      setCreatingTag(false);
    }
  };

  const availableTags = allTags.filter(
    (tag) => !activity?.tags?.some((item) => item.id === tag.id)
  );

  if (loading || !activity) {
    return (
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-card border border-border/50 rounded-3xl shadow-lg w-full max-w-4xl h-[70vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-muted-foreground" size={24} />
        </div>
      </div>
    );
  }

  const cfg = TYPE_CONFIG[activity.type] || TYPE_CONFIG.note;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border/50 rounded-3xl shadow-lg w-full max-w-4xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 sticky top-0 bg-card z-10 rounded-t-3xl">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${cfg.color}`}
            >
              {cfg.icon}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold tracking-tight">
                Detalle de actividad
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {cfg.label} creada el {formatDateTime(activity.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 xl:grid-cols-[1.5fr_0.9fr] gap-6">
          <div className="space-y-6">
            <section className="rounded-3xl border border-border/40 bg-muted/20 p-5">
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}
                >
                  {cfg.icon}
                  {cfg.label}
                </span>
                <button
                  onClick={() =>
                    activitiesApi
                      .update(tenantId, activity.id, {
                        completed: !activity.completed,
                      })
                      .then(onReload)
                  }
                  className={`text-xs font-semibold px-3 py-1.5 rounded-2xl border transition-colors ${
                    activity.completed
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {activity.completed ? "Completada" : "Marcar completada"}
                </button>
              </div>

              <div className="mt-4">
                <div className="flex items-start justify-between gap-3">
                  {editingTitle ? (
                    <div className="w-full space-y-2">
                      <input
                        value={titleDraft}
                        onChange={(e) => setTitleDraft(e.target.value)}
                        className="w-full bg-card border border-border/50 rounded-2xl px-4 py-3 text-lg font-bold tracking-tight focus:outline-none focus:border-foreground/40 transition-colors"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveField("title")}
                          disabled={savingField === "title"}
                          className="bg-foreground text-background px-3 py-2 rounded-2xl text-xs font-semibold inline-flex items-center gap-2"
                        >
                          {savingField === "title" ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Save size={14} />
                          )}
                          Guardar título
                        </button>
                        <button
                          onClick={() => {
                            setEditingTitle(false);
                            setTitleDraft(activity.title || "");
                          }}
                          className="border border-border px-3 py-2 rounded-2xl text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0">
                        <h3 className="text-2xl font-bold tracking-tight break-words">
                          {activity.title || "Sin título"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-2">
                          {activity.created_by?.full_name || currentUserName || "Usuario"} ·
                          {" "}
                          Actualizada {formatDateTime(activity.updated_at || activity.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={() => setEditingTitle(true)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Descripción
                  </p>
                  {!editingDescription && (
                    <button
                      onClick={() => setEditingDescription(true)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </div>

                {editingDescription ? (
                  <div className="space-y-2">
                    <textarea
                      value={descriptionDraft}
                      onChange={(e) => setDescriptionDraft(e.target.value)}
                      rows={6}
                      className="w-full bg-card border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-foreground/40 transition-colors resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveField("description")}
                        disabled={savingField === "description"}
                        className="bg-foreground text-background px-3 py-2 rounded-2xl text-xs font-semibold inline-flex items-center gap-2"
                      >
                        {savingField === "description" ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}
                        Guardar descripción
                      </button>
                      <button
                        onClick={() => {
                          setEditingDescription(false);
                          setDescriptionDraft(activity.description || "");
                        }}
                        className="border border-border px-3 py-2 rounded-2xl text-xs font-semibold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border/40 bg-card px-4 py-4 min-h-28">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {activity.description || "Añade contexto a esta actividad para que el equipo tenga más detalle."}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-border/40 bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={16} className="text-muted-foreground" />
                <h4 className="text-sm font-bold tracking-tight">
                  Comentarios
                </h4>
              </div>

              <div className="space-y-3">
                {(activity.comments || []).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/60 px-4 py-6 text-center">
                    <p className="text-sm font-medium">Sin comentarios todavía</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Usa este espacio para dejar contexto, feedback o próximos pasos.
                    </p>
                  </div>
                ) : (
                  activity.comments?.map((comment) => {
                    const isOwner = currentUserId === comment.author_id;
                    const isEditing = editingCommentId === comment.id;

                    return (
                      <div
                        key={comment.id}
                        className="rounded-2xl border border-border/40 bg-muted/20 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">
                              {comment.author?.full_name || "Usuario"}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {formatDateTime(comment.updated_at || comment.created_at)}
                            </p>
                          </div>
                          {isOwner && !isEditing && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setCommentDraft(comment.text);
                                }}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => deleteComment(comment.id)}
                                className="text-muted-foreground hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="mt-3 space-y-2">
                            <textarea
                              value={commentDraft}
                              onChange={(e) => setCommentDraft(e.target.value)}
                              rows={3}
                              className="w-full bg-card border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-foreground/40 transition-colors resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveComment(comment.id)}
                                className="bg-foreground text-background px-3 py-2 rounded-2xl text-xs font-semibold"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setCommentDraft("");
                                }}
                                className="border border-border px-3 py-2 rounded-2xl text-xs font-semibold"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-foreground mt-3 whitespace-pre-wrap">
                            {comment.text}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-4 space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  placeholder="Escribe un comentario..."
                  className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-foreground/40 transition-colors resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={addComment}
                    disabled={commentLoading || !newComment.trim()}
                    className="bg-foreground text-background px-4 py-2.5 rounded-2xl text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {commentLoading && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    Añadir comentario
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-border/40 bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Link2 size={16} className="text-muted-foreground" />
                <h4 className="text-sm font-bold tracking-tight">
                  Relaciones
                </h4>
              </div>

              <div className="space-y-3">
                <RelationCard
                  icon={<Building2 size={14} />}
                  label="Empresa"
                  title={activity.company?.name || "Sin empresa vinculada"}
                  subtitle={activity.company?.email || activity.company?.phone}
                />
                <RelationCard
                  icon={<User size={14} />}
                  label="Contacto"
                  title={
                    activity.contact
                      ? `${activity.contact.first_name} ${activity.contact.last_name || ""}`.trim()
                      : "Sin contacto vinculado"
                  }
                  subtitle={activity.contact?.email || activity.contact?.phone}
                />
                <RelationCard
                  icon={<ClipboardList size={14} />}
                  label="Deal"
                  title={activity.deal?.name || "Sin deal vinculado"}
                  subtitle={
                    activity.deal
                      ? `Estado: ${activity.deal.status} • Valor: €${(
                          activity.deal.value || 0
                        ).toLocaleString("es-ES")}`
                      : undefined
                  }
                />
              </div>
            </section>

            <section className="rounded-3xl border border-border/40 bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={16} className="text-muted-foreground" />
                <h4 className="text-sm font-bold tracking-tight">Etiquetas</h4>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {(activity.tags || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Esta actividad todavía no tiene etiquetas.
                  </p>
                ) : (
                  activity.tags?.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => removeTag(tag.id)}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border"
                      style={{
                        backgroundColor: `${tag.color || "#808080"}15`,
                        borderColor: `${tag.color || "#808080"}50`,
                        color: tag.color || "#808080",
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: tag.color || "#808080" }}
                      />
                      {tag.name}
                      <X size={12} />
                    </button>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={tagIdToAssign}
                    onChange={(e) => setTagIdToAssign(e.target.value)}
                    className="flex-1 bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
                  >
                    <option value="">Selecciona una etiqueta</option>
                    {availableTags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addTag}
                    disabled={!tagIdToAssign}
                    className="bg-foreground text-background px-4 py-2.5 rounded-2xl text-xs font-semibold disabled:opacity-50"
                  >
                    Añadir
                  </button>
                </div>

                <div className="rounded-2xl border border-border/40 bg-muted/20 p-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Crear nueva etiqueta
                  </p>
                  <input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Nombre de la etiqueta"
                    className="w-full bg-card border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
                  />
                  <div className="flex flex-wrap gap-2">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewTagColor(color)}
                        className={`w-7 h-7 rounded-full border-2 ${
                          newTagColor === color
                            ? "border-foreground scale-110"
                            : "border-white"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={createTag}
                    disabled={creatingTag || !newTagName.trim()}
                    className="w-full bg-card border border-border rounded-2xl py-2.5 text-xs font-semibold hover:border-foreground/30 transition-colors disabled:opacity-50"
                  >
                    {creatingTag ? "Creando..." : "Crear y asignar"}
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-border/40 bg-card p-5">
              <h4 className="text-sm font-bold tracking-tight mb-4">
                Metadatos
              </h4>
              <div className="space-y-3">
                <MetaRow label="Fecha límite" value={formatMaybeDate(activity.due_date)} />
                <MetaRow
                  label="Creada por"
                  value={activity.created_by?.full_name || currentUserName || "Usuario"}
                />
                <MetaRow
                  label="Email autor"
                  value={activity.created_by?.email || "—"}
                />
                <MetaRow
                  label="Estado"
                  value={activity.completed ? "Completada" : "Pendiente"}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityForm({
  tenantId,
  onClose,
  onCreated,
}: {
  tenantId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Activity["type"]>("task");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [contactId, setContactId] = useState("");
  const [dealId, setDealId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar las listas directamente al abrir el formulario
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    setLoadingOptions(true);
    Promise.all([
      companiesApi.list(tenantId),
      contactsApi.list(tenantId),
      dealsApi.list(tenantId),
    ])
      .then(([c, co, d]) => {
        setCompanies(c.data ?? []);
        setContacts(co.data ?? []);
        setDeals(d.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingOptions(false));
  }, [tenantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await activitiesApi.create(tenantId, {
        title,
        type,
        description: description || undefined,
        due_date: dueDate || undefined,
        company_id: companyId || undefined,
        contact_id: contactId || undefined,
        deal_id: dealId || undefined,
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
      <div className="bg-card border border-border/50 rounded-3xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 sticky top-0 bg-card z-10 rounded-t-3xl">
          <h2 className="text-sm font-bold tracking-tight">
            Nueva actividad
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField label="Título *">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
            />
          </FormField>

          <FormField label="Tipo">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Activity["type"])}
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
            >
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Descripción">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors resize-none"
            />
          </FormField>

          <FormField label="Fecha límite">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
            />
          </FormField>

          <FormField label="Empresa">
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              disabled={loadingOptions}
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors disabled:opacity-60"
            >
              <option value="">{loadingOptions ? "Cargando..." : "— Ninguna —"}</option>
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
              disabled={loadingOptions}
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors disabled:opacity-60"
            >
              <option value="">{loadingOptions ? "Cargando..." : "— Ninguno —"}</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name || ""}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Deal">
            <select
              value={dealId}
              onChange={(e) => setDealId(e.target.value)}
              disabled={loadingOptions}
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors disabled:opacity-60"
            >
              <option value="">{loadingOptions ? "Cargando..." : "— Ninguno —"}</option>
              {deals.map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.name}
                </option>
              ))}
            </select>
          </FormField>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

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
              disabled={loading || !title.trim()}
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

function RelationCard({
  icon,
  label,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-muted/20 px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold mt-2 break-words">{title}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1 break-words">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-right">{value}</span>
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-ES");
}

function formatMaybeDate(value?: string) {
  return value ? formatDate(value) : "—";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
