import type { Category } from "@/lib/generated/prisma/enums"

/**
 * Laza — textes publics en français simple et en malgache.
 *
 * Règles éditoriales (voir la mission « langage ») :
 * - phrases courtes (15 mots max), mots du quotidien, ton direct et respectueux ;
 * - aucun jargon technique visible (« empreinte SHA-256 », « modération collégiale »…).
 *
 * Le dictionnaire français sert de référence de type : si une clé manque en
 * malgache, TypeScript le signale.
 */

export const LANGS = ["fr", "mg"] as const
export type Lang = (typeof LANGS)[number]

export const DEFAULT_LANG: Lang = "fr"
/** Cookie de langue : lu côté serveur pour éviter tout clignotement au chargement. */
export const LANG_COOKIE = "laza_lang"

export const LANG_LABELS: Record<Lang, string> = { fr: "FR", mg: "MG" }
export const LANG_NAMES: Record<Lang, string> = { fr: "Français", mg: "Malagasy" }

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value)
}

export function normalizeLang(value: string | null | undefined): Lang {
  return isLang(value) ? value : DEFAULT_LANG
}

const fr = {
  language: {
    label: "Choisir la langue",
    fr: "Français",
    mg: "Malagasy",
  },

  header: {
    cta: "Signaler maintenant",
    feed: "Voir les signalements",
  },

  hero: {
    kicker: "Signalement anonyme · Madagascar",
    title: "On t'a volé ?",
    titleStrong: "Dis-le.",
    titleAccent: "Personne ne saura que c'est toi.",
    subtitle:
      "Laza reçoit ton signalement, vérifie les preuves avec une équipe, puis publie les faits sans ton nom.",
    cta: "Signaler maintenant",
    ctaNote: "Gratuit. Sans nom. Sans compte.",
    secondary: "Voir les signalements",
    reassure: "Ton numéro de CIN reste sur ton téléphone. On ne le voit jamais.",
    previewTitle: "Un vrai signalement publié",
    previewNote: "Ce dossier est réel. Il a été vérifié avant d'être publié.",
    previewEmptyTitle: "Aucun dossier publié pour l'instant",
    previewEmptyBody:
      "Les premiers signalements vérifiés apparaîtront ici. Tu peux être la première personne à en déposer un.",
    read: "Lire le dossier",
  },

  how: {
    eyebrow: "Comment ça marche",
    title: "Quatre étapes. C'est tout.",
    intro: "Tu n'as rien à installer. Un téléphone et cinq minutes suffisent.",
    steps: [
      { title: "Tu racontes", body: "Écris ce qui s'est passé, avec tes mots." },
      { title: "Tu ajoutes une preuve", body: "Photo, reçu, audio ou lien. Une seule suffit." },
      { title: "On vérifie", body: "Une vraie personne lit ton dossier sous 48 heures." },
      { title: "On publie", body: "Les faits sortent sans ton nom. Chacun peut les partager." },
    ],
  },

  trust: {
    eyebrow: "Pourquoi tu peux avoir confiance",
    title: "Ta sécurité, expliquée simplement.",
    items: [
      {
        title: "On ne demande pas ton nom",
        body: "Aucun champ ne demande ton nom. Tu choisis juste un pseudo.",
      },
      {
        title: "Ton CIN reste chez toi",
        body: "Il n'est jamais envoyé. Le site garde seulement une marque impossible à remonter jusqu'à toi.",
      },
      {
        title: "Chaque preuve est protégée",
        body: "Si quelqu'un modifie une preuve après l'envoi, on le voit tout de suite.",
      },
      {
        title: "Des personnes lisent, pas un robot",
        body: "Une équipe vérifie les faits avant de publier. Rien n'est publié automatiquement.",
      },
    ],
  },

  benefits: {
    eyebrow: "Ce que ça change pour toi",
    title: "Tu ne portes plus ça tout seul.",
    items: [
      "Ton histoire sort de ta tête. Elle devient visible.",
      "Les faits sont publics, ton nom ne l'est pas.",
      "Les journalistes et les institutions peuvent enquêter.",
      "Tu gardes une trace datée de ce que tu as vu.",
    ],
  },

  proof: {
    eyebrow: "Des chiffres, pas des promesses",
    title: "Tout ce que tu vois ici est réel.",
    intro:
      "Les chiffres viennent directement de la base du site. Nous n'inventons ni témoignage ni chiffre.",
    statReports: "Dossiers publiés",
    statEvidence: "Preuves vérifiées",
    statSupport: "Soutiens citoyens",
    emptyTitle: "Aucun dossier publié pour le moment",
    emptyBody:
      "Nous ne montrons pas de faux chiffres pour faire joli. Voici plutôt comment un dossier est traité.",
    processTitle: "Le chemin d'un signalement",
    process: [
      { title: "Tu envoies", body: "Ton dossier arrive chez les modérateurs. Ton nom n'y figure pas." },
      { title: "On vérifie", body: "On contrôle chaque preuve et on cherche des sources publiques." },
      { title: "On publie", body: "On retire les noms des autres personnes, puis on publie les faits." },
    ],
  },

  faq: {
    eyebrow: "Questions fréquentes",
    title: "Ce que les gens demandent avant d'envoyer.",
    items: [
      {
        q: "Est-ce que quelqu'un peut savoir que c'est moi ?",
        a: "Non. Tu mets un pseudo, pas ton nom. Ton numéro de CIN reste sur ton téléphone et n'est jamais envoyé.",
      },
      {
        q: "Et si je n'ai pas de preuve ?",
        a: "Écris quand même ton histoire et enregistre-la. Ajoute ce que tu as : une capture, un reçu, un audio ou un lien. Sans preuve, on ne peut pas vérifier les faits.",
      },
      {
        q: "Ça coûte combien ?",
        a: "Rien. C'est gratuit et ouvert à tous. Il n'y a pas de compte à créer.",
      },
      {
        q: "Que se passe-t-il après mon envoi ?",
        a: "Une équipe lit ton dossier, souvent en moins de 48 heures. Si les preuves sont solides, on publie les faits sans ton nom.",
      },
      {
        q: "Est-ce que ça marche sur mon téléphone ?",
        a: "Oui. Laza est fait pour le téléphone, même avec une connexion lente.",
      },
      {
        q: "Je ne suis pas la victime. Est-ce que je peux signaler ?",
        a: "Oui. Si tu as vu un fait de corruption, tu peux le raconter.",
      },
    ],
  },

  finalCta: {
    title: "Dis-le maintenant.",
    body: "Ça prend cinq minutes. Rien ne porte ton nom.",
    cta: "Signaler maintenant",
    note: "Gratuit. Sans nom. Sans compte.",
    secondary: "Voir les signalements",
  },

  footer: {
    tagline: "Signalement anonyme de corruption à Madagascar. Indépendant et gratuit.",
    sectionHelp: "Le site",
    sectionLegal: "Informations légales",
    links: {
      home: "Accueil",
      feed: "Signalements publiés",
      report: "Signaler un fait",
      how: "Comment ça marche",
      legal: "Mentions légales",
      terms: "Conditions d'utilisation",
      cookies: "Cookies",
      contact: "Nous contacter",
    },
    legalShort:
      "Un faux signalement est puni par la loi malgache (article 373.1 du Code pénal). Dépose seulement ce qui est vrai.",
    rights: "© 2026 Laza Madagascar · Plateforme citoyenne indépendante.",
  },

  form: {
    pageTitle: "Signaler un fait",
    pageIntro: "Quatre étapes, cinq minutes. Personne ne saura que c'est toi.",
    exit: "Quitter",
    steps: ["Ton récit", "Où et quoi", "Les preuves", "Toi"],
    progress: (step: number, total: number) => `Étape ${step} sur ${total}`,
    next: "Continuer",
    back: "Retour",
    save: "Enregistrer et continuer plus tard",
    saved: "Ton brouillon est enregistré sur ce téléphone.",
    savedFilesNote: "Les fichiers déjà ajoutés ne sont pas conservés dans le brouillon.",
    draftBannerTitle: "Tu as un signalement enregistré",
    draftBannerBody: "Tu peux le continuer là où tu t'es arrêté.",
    draftRestore: "Reprendre",
    draftDiscard: "Effacer",
    draftSavedAt: "Enregistré",

    step1: {
      title: "Qu'est-ce qui s'est passé ?",
      hint: "Écris comme tu parles. Le début, le milieu, la fin. Personne ne te jugera.",
      label: "Ton récit",
      placeholder:
        "Exemple : le 12 mars, au bureau des impôts d'Antananarivo, un agent m'a demandé 200 000 Ar pour sortir mon dossier…",
      reassurance: "Tu ne mets pas ton nom ici.",
      error: "Écris un peu plus : au moins deux ou trois phrases (40 caractères minimum).",
    },

    step2: {
      title: "Où et de quoi s'agit-il ?",
      hint: "Ces deux réponses aident à classer ton dossier. Tu peux rester vague.",
      categoryLabel: "C'est quel genre de problème ?",
      regionLabel: "Dans quelle région ?",
      regionPlaceholder: "Ex. Analamanga",
      regionHint: "Facultatif. Écris la région ou la ville si tu la connais.",
      reassurance: "Ne donne pas l'adresse exacte si tu as peur.",
      error: "Choisis un genre de problème pour continuer.",
    },

    step3: {
      title: "As-tu une preuve ?",
      hint: "Photo, capture d'écran, reçu, audio, vidéo, PDF ou lien vers une page publique.",
      addFiles: "Ajouter des fichiers",
      dropHint: "Appuie ici pour choisir tes fichiers",
      addLink: "Ajouter un lien",
      linkPlaceholder: "https://…",
      linkButton: "Ajouter",
      empty: "Aucune preuve ajoutée pour l'instant.",
      limit: "Maximum 5 pièces, 10 Mo par fichier.",
      fileReady: "Protégée avant l'envoi",
      reassurance: "Les fichiers partent depuis ton téléphone. On ne partage rien sans vérification.",
      error: "Il faut au moins une preuve pour envoyer ton signalement.",
      noProofTitle: "Pas de preuve sous la main ?",
      noProofBody:
        "Tu peux enregistrer ton récit maintenant et revenir plus tard. Un dossier sans preuve ne peut pas être vérifié, donc il ne sera pas publié.",
    },

    step4: {
      title: "Qui es-tu ?",
      hint: "On n'enregistre pas ton nom. On vérifie juste que tu es une vraie personne.",
      pseudoLabel: "Ton pseudo public",
      pseudoHint: "C'est le seul nom qui apparaîtra avec ton signalement.",
      surprise: "Au hasard",
      cinLabel: "Ton numéro de CIN",
      cinHint: "10 à 14 chiffres. Il reste sur ton téléphone et n'est jamais envoyé.",
      birthLabel: "Ta date de naissance",
      birthHint: "Elle sert avec ton CIN à créer ta marque anonyme.",
      generate: "Créer ma marque anonyme",
      computing: "Création en cours…",
      generated: "Ta marque anonyme est prête. C'est la seule chose qu'on enregistre.",
      reassurance: "Ton CIN et ta date de naissance ne quittent pas ton téléphone.",
    },

    review: {
      title: "Dernière vérification",
      hint: "Voici ce que les gens verront. Tu peux corriger le titre et le résumé.",
      titleLabel: "Titre affiché",
      summaryLabel: "Résumé affiché",
      summaryHint: "Deux ou trois phrases. C'est ce que les gens lisent en premier.",
      summaryTooShort: "Écris un résumé un peu plus long (20 caractères minimum).",
      recapStory: "Ton récit",
      recapEvidence: "Preuves",
      recapEvidenceCount: (files: number, links: number) =>
        `${files} fichier(s) et ${links} lien(s)`,
      recapIdentity: "Publié sous le pseudo",
      legalLabel:
        "Je certifie que ce que je raconte est vrai et que mes preuves sont vraies. Je comprends qu'un faux signalement est puni par la loi malgache (article 373.1).",
      send: "Envoyer mon signalement",
      sending: "Envoi en cours…",
      errorLegal: "Coche la case pour pouvoir envoyer.",
    },

    done: {
      title: "C'est envoyé. Merci.",
      body: "Ton signalement est arrivé. Il n'est pas encore public.",
      nextTitle: "Ce qui va se passer maintenant",
      next: [
        "Une équipe lit ton dossier. En général sous 48 heures.",
        "Elle vérifie les preuves et cherche d'autres sources.",
        "Si c'est solide, les faits sont publiés sans ton nom.",
      ],
      refLabel: "Ta référence",
      refHint: "Note-la. Elle sert à retrouver ton dossier auprès de la modération.",
      seeFeed: "Voir les signalements",
      again: "Signaler un autre fait",
    },

    files: {
      notAllowed: (name: string) => `Ce type de fichier n'est pas accepté : ${name}`,
      tooBig: (name: string) => `Fichier trop lourd (10 Mo maximum) : ${name}`,
      tooMany: "Maximum 5 pièces par signalement.",
      badLink: "Ce lien n'est pas valide. Il doit commencer par http:// ou https://",
    },

    errors: {
      network: "Pas de connexion. Vérifie ton réseau puis réessaie.",
      generic: "Une erreur est survenue. Réessaie.",
      pseudo: "Ce pseudo ne marche pas. Choisis 2 à 24 lettres ou chiffres.",
      cin: "Ce numéro de CIN ne marche pas. Il faut 10 à 14 chiffres.",
      birth: "Cette date de naissance ne marche pas.",
      commitment: "Crée d'abord ta marque anonyme.",
    },

    categories: {
      MARCHES_PUBLICS: "Marché ou chantier public",
      FONCIER: "Terre, terrain, titre",
      DOUANES_IMPOTS: "Impôts ou douane",
      SANTE: "Santé, hôpital",
      EDUCATION: "École, université",
      JUSTICE: "Justice, tribunal",
      SECURITE: "Police, gendarmerie",
      MINES: "Mines, ressources",
      TELECOMS: "Télécom, internet",
      ENERGIE: "Eau, électricité",
      AUTRE: "Autre chose",
    } satisfies Record<Category, string>,
  },
}

const mg: Copy = {
  language: {
    label: "Safidio ny fiteny",
    fr: "Frantsay",
    mg: "Malagasy",
  },

  header: {
    cta: "Mitatitra izao",
    feed: "Hijery ny fitarainana",
  },

  hero: {
    kicker: "Fitarainana tsy mitonona anarana · Madagasikara",
    title: "Nangalarina ianao ?",
    titleStrong: "Lazao izany.",
    titleAccent: "Tsy hisy hahafantatra anao.",
    subtitle:
      "Mandray ny fitarainanao i Laza, manamarina ny porofo miaraka amin'ny ekipa, avy eo mamoaka ny zava-misy tsy misy anaranao.",
    cta: "Mitatitra izao",
    ctaNote: "Maimaim-poana. Tsy misy anarana. Tsy mila kaonty.",
    secondary: "Hijery ny fitarainana",
    reassure: "Ny laharana CIN-nao dia mijanona ao amin'ny findainao. Tsy hitantsika mihitsy izy.",
    previewTitle: "Fitarainana tena navoaka",
    previewNote: "Tena misy ity rakitra ity. Noamarina izy vao navoaka.",
    previewEmptyTitle: "Mbola tsy misy rakitra navoaka",
    previewEmptyBody:
      "Hiseho eto ny fitarainana voamarina voalohany. Ianao no mety ho voalohany mitatitra.",
    read: "Vakio ny rakitra",
  },

  how: {
    eyebrow: "Ahoana no fiasany",
    title: "Efatra dingana. Izay ihany.",
    intro: "Tsy mila mametraka na inona na inona ianao. Finday sy dimy minitra dia ampy.",
    steps: [
      { title: "Mitantara ianao", body: "Soraty amin'ny teninao izay zava-nitranga." },
      { title: "Manampy porofo ianao", body: "Sary, rosia, feo na rohy. Iray dia ampy." },
      { title: "Manamarina izahay", body: "Olona tena izy no mamaky ny rakitrao ao anatin'ny 48 ora." },
      { title: "Mamoaka izahay", body: "Mivoaka ny zava-misy tsy misy anaranao. Afaka mizara azy ny rehetra." },
    ],
  },

  trust: {
    eyebrow: "Nahoana no matoky anay ?",
    title: "Ny fiarovanao, hazavaina tsotra.",
    items: [
      {
        title: "Tsy mangataka ny anaranao izahay",
        body: "Tsy misy fanontaniana momba ny anaranao. Misafidiana solon'anarana fotsiny ianao.",
      },
      {
        title: "Mijanona ao aminao ny CIN-nao",
        body: "Tsy alefa mihitsy izy. Marika tsy azo averina amin'ianao ihany no tehirizin'ny tranokala.",
      },
      {
        title: "Voaaro ny porofo tsirairay",
        body: "Raha misy manova porofo aorian'ny fandefasana, hita avy hatrany izany.",
      },
      {
        title: "Olona no mamaky, fa tsy milina",
        body: "Ekipa iray no manamarina ny zava-misy vao mamoaka. Tsy misy avoaka ho azy.",
      },
    ],
  },

  benefits: {
    eyebrow: "Izay miova ho anao",
    title: "Tsy mitondra izany irery intsony ianao.",
    items: [
      "Mivoaka ny tantaranao. Hita izy.",
      "Hita ny zava-misy, tsy hita ny anaranao.",
      "Afaka manadihady izany ny mpanao gazety sy ny manam-pahefana.",
      "Mitahiry porofo misy daty momba izay hitanao ianao.",
    ],
  },

  proof: {
    eyebrow: "Isa, fa tsy teny fotsiny",
    title: "Tena izy avokoa izay hitanao eto.",
    intro:
      "Mivantana avy amin'ny angon-drakitry ny tranokala ny isa. Tsy mamorona tantara na isa izahay.",
    statReports: "Rakitra navoaka",
    statEvidence: "Porofo voamarina",
    statSupport: "Fanohanana vahoaka",
    emptyTitle: "Mbola tsy misy rakitra navoaka",
    emptyBody:
      "Tsy mampiseho isa sandoka izahay. Izao kosa no fomba fitantanana ny rakitra iray.",
    processTitle: "Ny dian'ny fitarainana iray",
    process: [
      { title: "Mandefa ianao", body: "Tongany amin'ny mpanara-maso ny rakitrao. Tsy misy anaranao ao." },
      { title: "Manamarina izahay", body: "Dinihintsika ny porofo tsirairay ary mitady loharano hafa." },
      { title: "Mamoaka izahay", body: "Esorintsika ny anaran'olona hafa, avy eo avoakantsika ny zava-misy." },
    ],
  },

  faq: {
    eyebrow: "Fanontaniana mahazatra",
    title: "Izay anontanian'ny olona vao mandefa.",
    items: [
      {
        q: "Mety ho fantatry ny olona ve fa izaho no nanao izany ?",
        a: "Tsia. Solon'anarana no omenao, fa tsy ny anaranao. Ny CIN-nao dia mijanona ao amin'ny findainao ary tsy alefa mihitsy.",
      },
      {
        q: "Ahoana raha tsy manana porofo aho ?",
        a: "Soraty ihany ny tantaranao ary tehirizo. Ampio izay anananao : sary, rosia, feo na rohy. Raha tsy misy porofo, tsy afaka manamarina ny zava-misy izahay.",
      },
      {
        q: "Ohatrinona izany ?",
        a: "Tsy misy sarany. Maimaim-poana ho an'ny rehetra. Tsy mila mamorona kaonty.",
      },
      {
        q: "Inona no mitranga aorian'ny fandefasako ?",
        a: "Mamaky ny rakitrao ny ekipa, matetika ao anatin'ny 48 ora. Raha mafy ny porofo, avoakantsika ny zava-misy tsy misy anaranao.",
      },
      {
        q: "Mandeha amin'ny findaiko ve izany ?",
        a: "Eny. Natao ho an'ny finday i Laza, na dia miadana aza ny aterineto.",
      },
      {
        q: "Tsy izaho no niharam-boina. Afaka mitatitra ve aho ?",
        a: "Eny. Raha nahita kolikoly ianao, afaka mitantara izany.",
      },
    ],
  },

  finalCta: {
    title: "Lazao izao.",
    body: "Dimy minitra ny hatevenany. Tsy misy anaranao.",
    cta: "Mitatitra izao",
    note: "Maimaim-poana. Tsy misy anarana. Tsy mila kaonty.",
    secondary: "Hijery ny fitarainana",
  },

  footer: {
    tagline: "Fitarainana tsy mitonona anarana momba ny kolikoly eto Madagasikara. Mahaleo tena sy maimaim-poana.",
    sectionHelp: "Ny tranokala",
    sectionLegal: "Fampahalalana ara-dalàna",
    links: {
      home: "Fandraisana",
      feed: "Fitarainana navoaka",
      report: "Mitatitra",
      how: "Ahoana no fiasany",
      legal: "Fanamarihana ara-dalàna",
      terms: "Fepetran'ny fampiasana",
      cookies: "Cookies",
      contact: "Mifandraisa aminay",
    },
    legalShort:
      "Sazy ara-dalàna ny fitarainana sandoka eto Madagasikara (373.1 amin'ny fehezan-dalàna famaizana). Ny marina ihany no atolory.",
    rights: "© 2026 Laza Madagascar · Tranokala mahaleo tena.",
  },

  form: {
    pageTitle: "Mitatitra zava-misy",
    pageIntro: "Efatra dingana, dimy minitra. Tsy hisy hahafantatra anao.",
    exit: "Hiala",
    steps: ["Ny tantaranao", "Aiza sy inona", "Ny porofo", "Ianao"],
    progress: (step: number, total: number) => `Dingana ${step} amin'ny ${total}`,
    next: "Hanohy",
    back: "Hiverina",
    save: "Tehirizo ary hanohy aoriana",
    saved: "Voatahiry ao amin'ny findainao ny volavolanao.",
    savedFilesNote: "Tsy tehirizina ao anatin'ny volavola ny rakitra efa nampidirinao.",
    draftBannerTitle: "Misy fitarainana voatahiry ianao",
    draftBannerBody: "Afaka manohy izay nifoananao ianao.",
    draftRestore: "Hanohy",
    draftDiscard: "Fafana",
    draftSavedAt: "Voatahiry",

    step1: {
      title: "Inona no zava-nitranga ?",
      hint: "Soraty araka ny fiteninao. Ny fiandohana, ny afovoany, ny fiafarana. Tsy hisy hitsara anao.",
      label: "Ny tantaranao",
      placeholder:
        "Ohatra : tamin'ny 12 martsa, tao amin'ny biraon'ny hetra Antananarivo, nangataka 200 000 Ar tamin'ahy ny mpiasa iray mba hampivoaka ny rakitrako…",
      reassurance: "Tsy asoratrao eto ny anaranao.",
      error: "Soraty kely misimisy kokoa : roa na telo fehezanteny (40 litera farafahakeliny).",
    },

    step2: {
      title: "Aiza ary inona izany ?",
      hint: "Manampy amin'ny fandaharana ny rakitrao ireo valiny roa ireo. Mety ho ankapobeny ihany ianao.",
      categoryLabel: "Karazana olana manao ahoana izany ?",
      regionLabel: "Ao amin'ny faritra inona ?",
      regionPlaceholder: "Ohatra : Analamanga",
      regionHint: "Tsy voatery. Soraty ny faritra na ny tanàna raha fantatrao.",
      reassurance: "Aza manome ny adiresy marina raha matahotra ianao.",
      error: "Misafidiana karazana olana hanohizana.",
    },

    step3: {
      title: "Manana porofo ve ianao ?",
      hint: "Sary, sary-tsindry, rosia, feo, horonantsary, PDF na rohy mankany amin'ny tranokala.",
      addFiles: "Manampy rakitra",
      dropHint: "Tsindrio eto hisafidianana ny rakitrao",
      addLink: "Manampy rohy",
      linkPlaceholder: "https://…",
      linkButton: "Ampio",
      empty: "Mbola tsy misy porofo nampidirina.",
      limit: "5 rakitra ny fetra, 10 Mo isaky ny rakitra.",
      fileReady: "Voaro vao alefa",
      reassurance: "Avotra amin'ny findainao ny rakitra. Tsy zarainay izy raha tsy voamarina.",
      error: "Mila porofo iray farafahakeliny handefasana ny fitarainanao.",
      noProofTitle: "Tsy manana porofo amin'izao ?",
      noProofBody:
        "Afaka mitahiry ny tantaranao ianao ary hiverina aoriana. Tsy azo hamarinina ny rakitra tsy misy porofo, ka tsy havoaka izy.",
    },

    step4: {
      title: "Iza ianao ?",
      hint: "Tsy tehirizinay ny anaranao. Manamarina fotsiny izahay fa tena olona ianao.",
      pseudoLabel: "Ny solon'anaranao ho an'ny besinimaro",
      pseudoHint: "Io ihany no anarana hiseho miaraka amin'ny fitarainanao.",
      surprise: "Kisendrasendra",
      cinLabel: "Ny laharana CIN-nao",
      cinHint: "10 ka hatramin'ny 14 isa. Mijanona ao amin'ny findainao izy ary tsy alefa.",
      birthLabel: "Ny daty nahaterahanao",
      birthHint: "Ampiasaina miaraka amin'ny CIN hamoronana ny marika tsy mitonona anarana.",
      generate: "Hamorona ny marika tsy mitonona anarana",
      computing: "Eo am-panamboarana…",
      generated: "Vonona ny marikao. Io ihany no voatahiry.",
      reassurance: "Tsy miala amin'ny findainao ny CIN sy ny daty nahaterahanao.",
    },

    review: {
      title: "Fanamarinana farany",
      hint: "Izao no ho hitan'ny olona. Afaka manitsy ny lohahevitra sy ny famintinana ianao.",
      titleLabel: "Lohahevitra aseho",
      summaryLabel: "Famintinana aseho",
      summaryHint: "Roa na telo fehezanteny. Io no vakian'ny olona aloha.",
      summaryTooShort: "Soraty lava kely ny famintinana (20 litera farafahakeliny).",
      recapStory: "Ny tantaranao",
      recapEvidence: "Porofo",
      recapEvidenceCount: (files: number, links: number) =>
        `rakitra ${files} sy rohy ${links}`,
      recapIdentity: "Avoaka amin'ny solon'anarana",
      legalLabel:
        "Manambara aho fa marina izay lazaiko ary marina ny porofoko. Fantatro fa misy sazy ny fitarainana sandoka eto Madagasikara (373.1 amin'ny fehezan-dalàna famaizana).",
      send: "Alefa ny fitarainako",
      sending: "Eo am-pandefasana…",
      errorLegal: "Tsindrio ny efamira vao afaka mandefa.",
    },

    done: {
      title: "Voalefa izy. Misaotra.",
      body: "Tonga ny fitarainanao. Mbola tsy avoaka izy.",
      nextTitle: "Izay hitranga manaraka",
      next: [
        "Mamaky ny rakitrao ny ekipa. Matetika ao anatin'ny 48 ora.",
        "Hamarininy ny porofo ary hitady loharano hafa.",
        "Raha mafy izany, avoaka ny zava-misy tsy misy anaranao.",
      ],
      refLabel: "Ny laharan-taratao",
      refHint: "Soraty izy. Ampiasaina hitadiavana ny rakitrao amin'ny mpanara-maso.",
      seeFeed: "Hijery ny fitarainana",
      again: "Mitatitra zavatra hafa",
    },

    files: {
      notAllowed: (name: string) => `Tsy ekena io karazana rakitra io : ${name}`,
      tooBig: (name: string) => `Mavesatra loatra ny rakitra (10 Mo ny fetra) : ${name}`,
      tooMany: "5 rakitra ny fetra isaky ny fitarainana.",
      badLink: "Tsy mety io rohy io. Tsy maintsy manomboka amin'ny http:// na https://",
    },

    errors: {
      network: "Tsy misy fifandraisana. Hamarino ny aterineto dia andramo indray.",
      generic: "Nisy olana. Andramo indray.",
      pseudo: "Tsy mety io solon'anarana io. Misafidiana litera na isa 2 ka hatramin'ny 24.",
      cin: "Tsy mety io laharana CIN io. Mila isa 10 ka hatramin'ny 14.",
      birth: "Tsy mety io daty nahaterahana io.",
      commitment: "Mamorona aloha ny marika tsy mitonona anarana.",
    },

    categories: {
      MARCHES_PUBLICS: "Tsenam-bolan'ny fanjakana",
      FONCIER: "Tany sy taratasy fananana",
      DOUANES_IMPOTS: "Hetra na fadin-tseranana",
      SANTE: "Fahasalamana, hopitaly",
      EDUCATION: "Sekoly, oniversite",
      JUSTICE: "Fitsarana",
      SECURITE: "Polisy, zandary",
      MINES: "Harena an-kibon'ny tany",
      TELECOMS: "Telefaona, aterineto",
      ENERGIE: "Rano, herinaratra",
      AUTRE: "Zavatra hafa",
    } satisfies Record<Category, string>,
  },
}

export type Copy = typeof fr

export const dictionaries: Record<Lang, Copy> = { fr, mg }

export function getCopy(lang: Lang): Copy {
  return dictionaries[lang]
}
