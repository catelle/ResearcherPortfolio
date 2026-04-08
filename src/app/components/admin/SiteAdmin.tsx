import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Edit2, Plus, Save, Trash2, X } from "lucide-react";
import { useData } from "../../context/DataContext";
import {
  countryMapOptions,
  getCountryMapDisplayName,
} from "../../lib/country-map-data";
import {
  buildLocalizedListValue,
  buildLocalizedTextValue,
  createContentItemId,
  getLocalizedText,
  socialIconOptions,
  toLocalizedDraft,
  toLocalizedListDraft,
  type FormCardEffectStyle,
  type LocalizedText,
  type SectionOrbitingBackgrounds,
  type SectionBackgroundStyle,
  type SiteCursorStyle,
  type SocialLink,
} from "../../lib/portfolio-content";
import { normalizeThemeAccentColor } from "../../lib/theme-accent";
import { LocalizedFieldGroup } from "./LocalizedFields";

function parseLineList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

const cursorStyleOptions: Array<{
  value: SiteCursorStyle;
  label: string;
  description: string;
}> = [
  {
    value: "default",
    label: "Default cursor",
    description: "Keep the standard browser pointer.",
  },
  {
    value: "accent-dot",
    label: "Accent dot",
    description: "Small animated accent follower.",
  },
  {
    value: "ring",
    label: "Accent ring",
    description: "Soft ring with a glowing center.",
  },
  {
    value: "heart",
    label: "Heart pointer",
    description: "Rounded pointer with a pulsing heart.",
  },
  {
    value: "emoji",
    label: "Emoji pointer",
    description: "Playful animated emoji follower.",
  },
];

const orbitingSectionOptions: Array<{
  key: keyof SectionOrbitingBackgrounds;
  label: string;
}> = [
  { key: "hero", label: "Hero" },
  { key: "about", label: "About" },
  { key: "projects", label: "Projects" },
  { key: "skills", label: "Skills" },
  { key: "blog", label: "Blog" },
  { key: "recommendations", label: "Recommendations" },
  { key: "vision", label: "Vision" },
  { key: "contact", label: "Contact" },
];

const backgroundStyleOptions: Array<{
  value: SectionBackgroundStyle;
  label: string;
}> = [
  { value: "none", label: "None" },
  { value: "orbit", label: "Orbiting icons" },
  { value: "particles", label: "Particles" },
  { value: "dotted-map", label: "Dotted map" },
];

const formCardEffectOptions: Array<{
  value: FormCardEffectStyle;
  label: string;
}> = [
  { value: "none", label: "None" },
  { value: "border-beam", label: "Border beam" },
  { value: "shine-border", label: "Shine border" },
];

export function SiteAdmin({ canEdit }: { canEdit: boolean }) {
  const { content, saveContent, saving, uploading, uploadAsset } = useData();
  const [formData, setFormData] = useState({
    site: content.site,
    hero: content.hero,
    contact: content.contact,
  });
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [socialForm, setSocialForm] = useState({
    icon: socialIconOptions[0],
    label: { en: "", fr: "" } as LocalizedText,
    href: "",
    color: "#a855f7",
  });
  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null);
  const [isSocialFormOpen, setIsSocialFormOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      site: content.site,
      hero: content.hero,
      contact: content.contact,
    });
    setPortraitFile(null);
  }, [content]);

  const resetSocialForm = () => {
    setSocialForm({
      icon: socialIconOptions[0],
      label: { en: "", fr: "" },
      href: "",
      color: "#a855f7",
    });
    setEditingSocial(null);
    setIsSocialFormOpen(false);
  };

  const persistFormData = async (
    nextFormData: typeof formData,
    successMessage: string,
  ) => {
    const result = await saveContent(
      (current) => ({
        ...current,
        site: nextFormData.site,
        hero: nextFormData.hero,
        contact: nextFormData.contact,
      }),
      successMessage,
    );

    setFeedback(result.message);

    if (result.success) {
      setFormData(nextFormData);
    }

    return result;
  };

  const handleSocialSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextSocialLink: SocialLink = {
      id: editingSocial?.id ?? createContentItemId("social"),
      icon: socialForm.icon,
      label: buildLocalizedTextValue(socialForm.label),
      href: socialForm.href,
      color: socialForm.color,
    };

    const nextFormData = {
      ...formData,
      contact: {
        ...formData.contact,
        socialLinks: editingSocial
          ? formData.contact.socialLinks.map((item) =>
              item.id === editingSocial.id ? nextSocialLink : item,
            )
          : [...formData.contact.socialLinks, nextSocialLink],
      },
    };

    const result = await persistFormData(
      nextFormData,
      editingSocial
        ? "Social link updated successfully."
        : "Social link added successfully.",
    );

    if (result.success) {
      resetSocialForm();
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    let nextFormData = formData;

    if (portraitFile) {
      const uploadResult = await uploadAsset(
        portraitFile,
        "profile",
        "Profile image uploaded successfully.",
      );

      if (!uploadResult.success || !uploadResult.url) {
        setFeedback(uploadResult.message);
        return;
      }

      nextFormData = {
        ...formData,
        hero: {
          ...formData.hero,
          portraitUrl: uploadResult.url,
        },
      };
    }

    const result = await persistFormData(
      nextFormData,
      "Site settings saved successfully.",
    );

    if (result.success) {
      setPortraitFile(null);
    }
  };

  const handleDeleteSocial = async (socialId: string) => {
    const nextFormData = {
      ...formData,
      contact: {
        ...formData.contact,
        socialLinks: formData.contact.socialLinks.filter(
          (social) => social.id !== socialId,
        ),
      },
    };

    await persistFormData(nextFormData, "Social link deleted successfully.");
  };

  const updateSectionBackground = (
    sectionKey: keyof SectionOrbitingBackgrounds,
    changes: Partial<(typeof formData.site.sectionBackgrounds)[keyof SectionOrbitingBackgrounds]>,
  ) => {
    const nextSettings = {
      ...formData.site.sectionBackgrounds[sectionKey],
      ...changes,
    };

    setFormData({
      ...formData,
      site: {
        ...formData.site,
        sectionBackgrounds: {
          ...formData.site.sectionBackgrounds,
          [sectionKey]: nextSettings,
        },
        orbitingBackgrounds: {
          ...formData.site.orbitingBackgrounds,
          [sectionKey]: nextSettings.style === "orbit",
        },
      },
    });
  };

  const opportunitiesValue = toLocalizedListDraft(formData.contact.opportunities);
  const terminalLinesValue = toLocalizedListDraft(formData.hero.terminalLines);

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Site Content</h2>
          <p className="text-muted-foreground mt-2">
            Manage the brand name, hero copy, and contact section content that
            appears across the homepage.
          </p>
        </div>

        <motion.button
          type="submit"
          form="site-admin-form"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!canEdit || saving || uploading}
          className="px-6 py-3 theme-accent-button rounded-lg font-medium disabled:opacity-60 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {uploading ? "Uploading..." : saving ? "Saving..." : "Save Site"}
        </motion.button>
      </div>

      {feedback ? (
        <p className="text-sm text-muted-foreground">{feedback}</p>
      ) : null}

      <form id="site-admin-form" onSubmit={handleSave} className="space-y-8">
        <div className="p-8 rounded-2xl bg-card border border-border space-y-6">
          <h3 className="text-xl font-bold text-foreground">Brand & Footer</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <LocalizedFieldGroup
              label="Brand Name"
              value={toLocalizedDraft(formData.site.brandName)}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  site: {
                    ...formData.site,
                    brandName: buildLocalizedTextValue(value),
                  },
                })
              }
              disabled={!canEdit}
            />

            <LocalizedFieldGroup
              label="Footer Prefix"
              value={toLocalizedDraft(formData.site.footerPrefix)}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  site: {
                    ...formData.site,
                    footerPrefix: buildLocalizedTextValue(value),
                  },
                })
              }
              disabled={!canEdit}
            />
          </div>

          <div className="grid md:grid-cols-[minmax(0,1fr)_240px] gap-6 items-end">
            <LocalizedFieldGroup
              label="Footer Highlight"
              value={toLocalizedDraft(formData.site.footerHighlight)}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  site: {
                    ...formData.site,
                    footerHighlight: buildLocalizedTextValue(value),
                  },
                })
              }
              disabled={!canEdit}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Accent Color
              </label>
              <input
                type="color"
                value={normalizeThemeAccentColor(formData.site.themeAccentColor)}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    site: {
                      ...formData.site,
                      themeAccentColor: event.target.value,
                    },
                  })
                }
                disabled={!canEdit}
                className="h-12 w-full rounded-lg bg-background border border-border"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Updates the shared highlight color after you save.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-card border border-border space-y-6">
          <div>
            <h3 className="text-xl font-bold text-foreground">
              Visual Effects
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Control optional presentation effects across the public website.
            </p>
          </div>

          <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Cursor Style
              </label>
              <select
                value={formData.site.cursorStyle}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    site: {
                      ...formData.site,
                      cursorStyle: event.target.value as SiteCursorStyle,
                    },
                  })
                }
                disabled={!canEdit}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
              >
                {cursorStyleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-muted-foreground">
                {
                  cursorStyleOptions.find(
                    (option) => option.value === formData.site.cursorStyle,
                  )?.description
                }
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-sm font-medium text-foreground">
                Section backgrounds
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose a background style for any section. Map mode lets you
                point a country, and particles mode uses your chosen color.
              </p>

              <div className="mt-4 grid gap-4">
                {orbitingSectionOptions.map((option) => {
                  const sectionSettings =
                    formData.site.sectionBackgrounds[option.key];
                  const mapPlaceholder = getCountryMapDisplayName(
                    sectionSettings.mapCountryCode,
                  );

                  return (
                    <div
                      key={option.key}
                      className="rounded-xl border border-border bg-card p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {option.label}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Select which animated background appears here.
                          </p>
                        </div>

                        <div className="w-full lg:max-w-xs">
                          <select
                            value={sectionSettings.style}
                            onChange={(event) =>
                              updateSectionBackground(option.key, {
                                style: event.target.value as SectionBackgroundStyle,
                              })
                            }
                            disabled={!canEdit}
                            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                          >
                            {backgroundStyleOptions.map((styleOption) => (
                              <option
                                key={styleOption.value}
                                value={styleOption.value}
                              >
                                {styleOption.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {sectionSettings.style === "particles" ? (
                        <div className="mt-4 grid md:grid-cols-[minmax(0,1fr)_180px] gap-4 items-end">
                          <div className="text-xs text-muted-foreground">
                            Particle mode adds a floating dot field in the chosen
                            color behind the section.
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-foreground mb-2">
                              Particle Color
                            </label>
                            <input
                              type="color"
                              value={sectionSettings.particlesColor}
                              onChange={(event) =>
                                updateSectionBackground(option.key, {
                                  particlesColor: event.target.value,
                                })
                              }
                              disabled={!canEdit}
                              className="h-11 w-full rounded-lg bg-background border border-border"
                            />
                          </div>
                        </div>
                      ) : null}

                      {sectionSettings.style === "dotted-map" ? (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-medium text-foreground mb-2">
                              Country
                            </label>
                            <select
                              value={sectionSettings.mapCountryCode}
                              onChange={(event) =>
                                updateSectionBackground(option.key, {
                                  mapCountryCode: event.target.value,
                                })
                              }
                              disabled={!canEdit}
                              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                            >
                              {countryMapOptions.map((country) => (
                                <option key={country.code} value={country.code}>
                                  {country.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-foreground mb-2">
                              Map Label
                            </label>
                            <input
                              type="text"
                              value={sectionSettings.mapLabel}
                              onChange={(event) =>
                                updateSectionBackground(option.key, {
                                  mapLabel: event.target.value,
                                })
                              }
                              disabled={!canEdit}
                              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
                              placeholder={mapPlaceholder}
                            />
                            <p className="mt-2 text-xs text-muted-foreground">
                              Leave blank to use the selected country name.
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-card border border-border space-y-6">
          <h3 className="text-xl font-bold text-foreground">Hero Section</h3>

          <LocalizedFieldGroup
            label="Eyebrow"
            value={toLocalizedDraft(formData.hero.eyebrow)}
            onChange={(value) =>
              setFormData({
                ...formData,
                hero: {
                  ...formData.hero,
                  eyebrow: buildLocalizedTextValue(value),
                },
              })
            }
            disabled={!canEdit}
          />

          <div className="grid md:grid-cols-2 gap-6">
            <LocalizedFieldGroup
              label="Title Line One"
              value={toLocalizedDraft(formData.hero.titlePrefix)}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  hero: {
                    ...formData.hero,
                    titlePrefix: buildLocalizedTextValue(value),
                  },
                })
              }
              disabled={!canEdit}
            />

            <LocalizedFieldGroup
              label="Title Line Two"
              value={toLocalizedDraft(formData.hero.titleAccent)}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  hero: {
                    ...formData.hero,
                    titleAccent: buildLocalizedTextValue(value),
                  },
                })
              }
              disabled={!canEdit}
            />
          </div>

          <LocalizedFieldGroup
            label="Role Line"
            value={toLocalizedDraft(formData.hero.role)}
            onChange={(value) =>
              setFormData({
                ...formData,
                hero: {
                  ...formData.hero,
                  role: buildLocalizedTextValue(value),
                },
              })
            }
            disabled={!canEdit}
          />

          <LocalizedFieldGroup
            label="Description"
            value={toLocalizedDraft(formData.hero.description)}
            onChange={(value) =>
              setFormData({
                ...formData,
                hero: {
                  ...formData.hero,
                  description: buildLocalizedTextValue(value),
                },
              })
            }
            multiline
            rows={4}
            disabled={!canEdit}
          />

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description Display
              </label>
              <select
                value={formData.hero.descriptionDisplayMode}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    hero: {
                      ...formData.hero,
                      descriptionDisplayMode:
                        event.target.value as typeof formData.hero.descriptionDisplayMode,
                    },
                  })
                }
                disabled={!canEdit}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
              >
                <option value="text">Standard text</option>
                <option value="terminal">Animated terminal</option>
              </select>
            </div>

            <div className="rounded-lg bg-background border border-border px-4 py-3 text-sm text-muted-foreground">
              Standard text shows the current paragraph. Animated terminal shows
              the script below with command-style typing.
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Terminal Script
            </label>
            <LocalizedFieldGroup
              label="Terminal Script"
              value={terminalLinesValue}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  hero: {
                    ...formData.hero,
                    terminalLines: buildLocalizedListValue(value),
                  },
                })
              }
              multiline
              rows={6}
              disabled={!canEdit}
              englishPlaceholder={"$ whoami\nCybersecurity engineer and founder\n$ focus --today\nBuilding safer digital products for Africa"}
              frenchPlaceholder={"$ whoami\nIngenieure cybersécurité et fondatrice\n$ focus --today\nConstruire des produits numeriques plus surs pour l'Afrique"}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Put one terminal line per row. Lines starting with `$` are shown as
              typed commands. Other lines appear as command output.
            </p>
          </div>

          <label className="flex items-center gap-3 rounded-lg bg-background border border-border px-4 py-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={formData.hero.showSocialDock}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  hero: {
                    ...formData.hero,
                    showSocialDock: event.target.checked,
                  },
                })
              }
              disabled={!canEdit}
              className="h-4 w-4"
            />
            Show animated social dock under the portrait
          </label>

          <div className="grid md:grid-cols-2 gap-6">
            <LocalizedFieldGroup
              label="Primary Button Label"
              value={toLocalizedDraft(formData.hero.primaryCtaLabel)}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  hero: {
                    ...formData.hero,
                    primaryCtaLabel: buildLocalizedTextValue(value),
                  },
                })
              }
              disabled={!canEdit}
            />

            <LocalizedFieldGroup
              label="Secondary Button Label"
              value={toLocalizedDraft(formData.hero.secondaryCtaLabel)}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  hero: {
                    ...formData.hero,
                    secondaryCtaLabel: buildLocalizedTextValue(value),
                  },
                })
              }
              disabled={!canEdit}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Portrait URL
              </label>
              <input
                type="url"
                value={formData.hero.portraitUrl}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    hero: {
                      ...formData.hero,
                      portraitUrl: event.target.value,
                    },
                  })
                }
                disabled={!canEdit}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Paste an image URL, or leave this as-is and upload a file below.
              </p>
            </div>

            <LocalizedFieldGroup
              label="Portrait Alt Text"
              value={toLocalizedDraft(formData.hero.portraitAlt)}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  hero: {
                    ...formData.hero,
                    portraitAlt: buildLocalizedTextValue(value),
                  },
                })
              }
              disabled={!canEdit}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Upload Portrait Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setPortraitFile(event.target.files?.[0] ?? null)
              }
              disabled={!canEdit || saving || uploading}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Optional. The selected image will be uploaded to Supabase Storage
              when you save the site settings.
            </p>
            {portraitFile ? (
              <p className="mt-2 text-xs text-foreground">
                Selected file: {portraitFile.name}
              </p>
            ) : null}
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-card border border-border space-y-6">
          <h3 className="text-xl font-bold text-foreground">Contact Section</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <LocalizedFieldGroup
              label="Section Heading"
              value={toLocalizedDraft(formData.contact.heading)}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  contact: {
                    ...formData.contact,
                    heading: buildLocalizedTextValue(value),
                  },
                })
              }
              disabled={!canEdit}
            />

            <LocalizedFieldGroup
              label="Submit Button Label"
              value={toLocalizedDraft(formData.contact.submitLabel)}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  contact: {
                    ...formData.contact,
                    submitLabel: buildLocalizedTextValue(value),
                  },
                })
              }
              disabled={!canEdit}
            />
          </div>

          <LocalizedFieldGroup
            label="Intro Text"
            value={toLocalizedDraft(formData.contact.intro)}
            onChange={(value) =>
              setFormData({
                ...formData,
                contact: {
                  ...formData.contact,
                  intro: buildLocalizedTextValue(value),
                },
              })
            }
            multiline
            rows={3}
            disabled={!canEdit}
          />

          <div className="grid md:grid-cols-[minmax(0,1fr)_180px] gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Contact Form Card Effect
              </label>
              <select
                value={formData.contact.formCardEffect.style}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    contact: {
                      ...formData.contact,
                      formCardEffect: {
                        ...formData.contact.formCardEffect,
                        style: event.target.value as FormCardEffectStyle,
                      },
                    },
                  })
                }
                disabled={!canEdit}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none"
              >
                {formCardEffectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Effect Color
              </label>
              <input
                type="color"
                value={formData.contact.formCardEffect.color}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    contact: {
                      ...formData.contact,
                      formCardEffect: {
                        ...formData.contact.formCardEffect,
                        color: event.target.value,
                      },
                    },
                  })
                }
                disabled={!canEdit}
                className="h-12 w-full rounded-lg bg-background border border-border"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <LocalizedFieldGroup
              label="Name Label"
              value={toLocalizedDraft(formData.contact.nameLabel)}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  contact: {
                    ...formData.contact,
                    nameLabel: buildLocalizedTextValue(value),
                  },
                })
              }
              disabled={!canEdit}
            />

            <LocalizedFieldGroup
              label="Name Placeholder"
              value={toLocalizedDraft(formData.contact.namePlaceholder)}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  contact: {
                    ...formData.contact,
                    namePlaceholder: buildLocalizedTextValue(value),
                  },
                })
              }
              disabled={!canEdit}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <LocalizedFieldGroup
              label="Email Label"
              value={toLocalizedDraft(formData.contact.emailLabel)}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  contact: {
                    ...formData.contact,
                    emailLabel: buildLocalizedTextValue(value),
                  },
                })
              }
              disabled={!canEdit}
            />

            <LocalizedFieldGroup
              label="Email Placeholder"
              value={toLocalizedDraft(formData.contact.emailPlaceholder)}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  contact: {
                    ...formData.contact,
                    emailPlaceholder: buildLocalizedTextValue(value),
                  },
                })
              }
              disabled={!canEdit}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <LocalizedFieldGroup
              label="Message Label"
              value={toLocalizedDraft(formData.contact.messageLabel)}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  contact: {
                    ...formData.contact,
                    messageLabel: buildLocalizedTextValue(value),
                  },
                })
              }
              disabled={!canEdit}
            />

            <LocalizedFieldGroup
              label="Message Placeholder"
              value={toLocalizedDraft(formData.contact.messagePlaceholder)}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  contact: {
                    ...formData.contact,
                    messagePlaceholder: buildLocalizedTextValue(value),
                  },
                })
              }
              disabled={!canEdit}
            />
          </div>

          <LocalizedFieldGroup
            label="Opportunity Box Title"
            value={toLocalizedDraft(formData.contact.ctaTitle)}
            onChange={(value) =>
              setFormData({
                ...formData,
                contact: {
                  ...formData.contact,
                  ctaTitle: buildLocalizedTextValue(value),
                },
              })
            }
            disabled={!canEdit}
          />

          <LocalizedFieldGroup
            label="Opportunities"
            value={opportunitiesValue}
            onChange={(value) =>
              setFormData({
                ...formData,
                contact: {
                  ...formData.contact,
                  opportunities: buildLocalizedListValue(value),
                },
              })
            }
            multiline
            rows={5}
            disabled={!canEdit}
          />

          <LocalizedFieldGroup
            label="Social links heading"
            value={toLocalizedDraft(formData.contact.socialHeading)}
            onChange={(value) =>
              setFormData({
                ...formData,
                contact: {
                  ...formData.contact,
                  socialHeading: buildLocalizedTextValue(value),
                },
              })
            }
            disabled={!canEdit}
          />

          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold text-foreground">Social Links</h4>
              <p className="text-sm text-muted-foreground">
                Edit the cards displayed beside the contact form.
              </p>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSocialFormOpen(true)}
              disabled={!canEdit}
              className="px-5 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-accent disabled:opacity-60 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Social Link
            </motion.button>
          </div>

          {isSocialFormOpen ? (
            <div className="p-6 rounded-xl border border-border bg-background">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-lg font-semibold text-foreground">
                  {editingSocial ? "Edit Social Link" : "Add Social Link"}
                </h5>
                <button
                  type="button"
                  onClick={resetSocialForm}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSocialSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Icon
                    </label>
                    <select
                      value={socialForm.icon}
                      onChange={(event) =>
                        setSocialForm({
                          ...socialForm,
                          icon: event.target.value as typeof socialForm.icon,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground outline-none"
                      required
                    >
                      {socialIconOptions.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={socialForm.color}
                      onChange={(event) =>
                        setSocialForm({ ...socialForm, color: event.target.value })
                      }
                      className="w-full h-12 rounded-lg bg-card border border-border"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <LocalizedFieldGroup
                    label="Label"
                    value={socialForm.label}
                    onChange={(value) =>
                      setSocialForm({ ...socialForm, label: value })
                    }
                  />

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      URL
                    </label>
                    <input
                      type="url"
                      value={socialForm.href}
                      onChange={(event) =>
                        setSocialForm({ ...socialForm, href: event.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={saving}
                    className="px-5 py-3 theme-accent-button rounded-lg font-medium disabled:opacity-60 transition-colors"
                  >
                    {saving
                      ? "Syncing..."
                      : editingSocial
                        ? "Update Link"
                        : "Add Link"}
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={resetSocialForm}
                    className="px-5 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-accent transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </div>
          ) : null}

          <div className="grid md:grid-cols-2 gap-4">
            {formData.contact.socialLinks.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-background border border-border flex items-start justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {getLocalizedText(item.label, "en")}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.icon}</p>
                  <p className="text-sm text-muted-foreground break-all">
                    {item.href}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSocial(item);
                      setSocialForm({
                        icon: item.icon as typeof socialForm.icon,
                        label: toLocalizedDraft(item.label),
                        href: item.href,
                        color: item.color,
                      });
                      setIsSocialFormOpen(true);
                    }}
                    disabled={!canEdit}
                    className="p-2 rounded-lg bg-muted text-foreground hover:bg-accent disabled:opacity-60 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteSocial(item.id)}
                    disabled={!canEdit || saving}
                    className="p-2 rounded-lg bg-muted text-red-500 hover:bg-red-500/10 disabled:opacity-60 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
