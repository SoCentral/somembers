import { defineCollection } from "astro:content";
import axios from "axios";
import slugify from "slugify";

/** * UNIVERSAL SORT:
 * 1. Image presence (weighted 1 for has image, 0 for no image)
 * 2. Newest Profile first (createdAt descending)
 */
const sortDirectory = (a: any, b: any) => {
  const aHasImg = a.image ? 1 : 0;
  const bHasImg = b.image ? 1 : 0;

  // If one has an image and the other doesn't, put the one with the image first
  if (aHasImg !== bHasImg) return bHasImg - aHasImg;

  // If both have images (or both don't), sort by date (newest first)
  const dateA = new Date(a.createdAt || 0).getTime();
  const dateB = new Date(b.createdAt || 0).getTime();
  return dateB - dateA;
};

const proxyImage = (url: string | null) => {
  if (!url || url.includes("default.png")) return null;
  const path = url.replace(/^.*cloudfront\.net\//, "");
  return `https://ik.imagekit.io/socentral/${path}?tr=h-640`;
};

async function getOfficeRnDToken() {
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: import.meta.env.CLIENT_ID || "",
    client_secret: import.meta.env.CLIENT_SECRET || "",
    scope: "flex.community.members.read flex.community.companies.read",
  });
  const res = await axios.post(
    "https://identity.officernd.com/oauth/token",
    params,
  );
  return res.data.access_token;
}

async function fetchAll(endpoint: string, token: string) {
  let results: any[] = [];
  let nextCursor: string | null = null;
  do {
    const params = new URLSearchParams({ $limit: "50", status: "active" });
    if (nextCursor) params.append("$cursorNext", nextCursor);
    const url = `https://app.officernd.com/api/v2/organizations/socentral/${endpoint}?${params.toString()}`;
    const { data } = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (data.results) results.push(...data.results);
    nextCursor = data.cursorNext;
  } while (nextCursor);
  return results;
}

export const collections = {
  members: defineCollection({
    loader: async () => {
      console.log("🚀 Syncing Members...");
      const token = await getOfficeRnDToken();
      const rawCos = await fetchAll("companies", token);
      const companyMap = new Map();
      rawCos.forEach((c) => companyMap.set(c._id, c.name));

      const rawMembers = await fetchAll("members", token);

      const processed = rawMembers
        .filter((m) => m.portalPrivacy?.isVisible !== false)
        .map((m) => {
          const cid =
            typeof m.company === "object" ? m.company?._id : m.company;
          const teamName = cid ? companyMap.get(cid) || null : null;

          const teamSlug = teamName
            ? slugify(teamName, { lower: true, remove: /[*+~.()/'"?!:@]/g })
            : null;

          return {
            id: m._id,
            name: m.name,
            slug: slugify(m.name, { lower: true, remove: /[*+~.()/'"?!:@]/g }),
            createdAt: m.createdAt,
            image: proxyImage(m.image),
            teamName: teamName,
            teamSlug: teamSlug,
            description: m.description || null,
            email:
              m.portalPrivacy?.showContactDetails !== false
                ? m.email || null
                : null,
            phone:
              m.portalPrivacy?.showContactDetails !== false
                ? m.phone || m.mobilePhone || null
                : null,
            linkedin:
              m.portalPrivacy?.showSocialProfiles && m.socialProfiles?.linkedin
                ? m.socialProfiles.linkedin
                : null,
            tags: Array.isArray(m.tags) ? m.tags : [],
          };
        })
        .sort(sortDirectory);

      // Log the sorted members
      processed.forEach((m) => {
        console.log(
          `👤 ${m.image ? "[IMG]" : "[   ]"} ${m.name.padEnd(25)} | Joined: ${m.createdAt?.split("T")[0]}`,
        );
      });

      console.log(`✅ Synced ${processed.length} members.`);
      return processed;
    },
  }),

  teams: defineCollection({
    loader: async () => {
      console.log("\n🚀 Syncing Companies...");
      const token = await getOfficeRnDToken();
      const rawCos = await fetchAll("companies", token);
      const rawMembers = await fetchAll("members", token);

      const idToName = new Map();
      rawCos.forEach((c) => idToName.set(c._id, c.name));

      const nameBuckets = new Map();
      rawMembers.forEach((m) => {
        if (m.portalPrivacy?.isVisible !== false) {
          const cid =
            typeof m.company === "object" ? m.company?._id : m.company;
          const companyName = idToName.get(cid);

          if (companyName) {
            const list = nameBuckets.get(companyName) || [];
            list.push({
              name: m.name,
              slug: slugify(m.name, {
                lower: true,
                remove: /[*+~.()/'"?!:@]/g,
              }),
            });
            nameBuckets.set(companyName, list);
          }
        }
      });

      const processed = rawCos
        .filter((c) => c.portalPrivacy?.isVisible !== false)
        .map((c) => {
          const members = nameBuckets.get(c.name) || [];
          return {
            id: c._id,
            name: c.name,
            slug: slugify(c.name, { lower: true, remove: /[*+~.()/'"?!:@]/g }),
            createdAt: c.createdAt,
            image: proxyImage(c.image),
            url: c.url
              ? c.url.startsWith("http")
                ? c.url
                : "//" + c.url
              : null,
            description: c.description || null,
            members: members,
          };
        })
        .filter((v, i, a) => a.findIndex((t) => t.name === v.name) === i)
        .sort(sortDirectory);

      // Log the sorted companies
      processed.forEach((t) => {
        console.log(
          `🏢 ${t.image ? "[IMG]" : "[   ]"} ${t.name.padEnd(25)} | Members: ${t.members.length.toString().padEnd(2)} | Created: ${t.createdAt?.split("T")[0]}`,
        );
      });

      console.log(`✅ Synced ${processed.length} unique companies.`);
      return processed;
    },
  }),
};
