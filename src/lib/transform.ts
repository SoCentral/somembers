/**
 * Data transformation layer for OfficeRnD API data.
 *
 * Transforms raw API responses into the format needed for Astro templates.
 * Handles:
 * - Image URL conversion (CloudFront -> ImageKit)
 * - Slug generation
 * - Privacy filtering and field inversion
 * - SDG extraction
 * - Social profile normalization
 */

import slugify from "slugify";
import type {
  ApiMember,
  ApiCompany,
  PortalPrivacy,
  ApiProperties,
  SocialProfiles,
  TransformedMember,
  TransformedCompany,
  TransformedPrivacy,
  TeamMemberReference,
} from "./types";

// ============================================================================
// Constants
// ============================================================================

/**
 * Default image URL for profiles without images
 */
const DEFAULT_IMAGE_URL =
  "https://cdn.prod.website-files.com/633d71ff5625100570e7e68c/68f8d711d95a532bded7c6c3_default.png";

/**
 * ImageKit base URL for transformed images
 */
const IMAGEKIT_BASE_URL = "https://ik.imagekit.io/socentral/";

/**
 * ImageKit transformation parameters
 */
const IMAGEKIT_TRANSFORM = "?tr=h-640";

/**
 * Slugify options to match the existing site format
 */
const SLUGIFY_OPTIONS = {
  lower: true,
  remove: /[*+~.()/'"?!:@]/g,
};

// ============================================================================
// Image Transformation
// ============================================================================

/**
 * Transforms a CloudFront image URL to an ImageKit URL.
 *
 * Input formats:
 * - https://xxx.cloudfront.net/path/to/image.jpg
 * - //xxx.cloudfront.net/path/to/image.jpg
 * - null/undefined
 *
 * Output:
 * - https://ik.imagekit.io/socentral/path/to/image.jpg?tr=h-640
 * - Default image URL if input is null/undefined
 *
 * @param imageUrl - The raw image URL from the API
 * @returns The transformed ImageKit URL or default image
 */
export function transformImageUrl(imageUrl: string | null | undefined): string {
  if (imageUrl == null) {
    return DEFAULT_IMAGE_URL;
  }

  // Extract path after cloudfront.net/
  const cleanPath = imageUrl.replace(/^.*cloudfront\.net\//, "");

  return IMAGEKIT_BASE_URL + cleanPath + IMAGEKIT_TRANSFORM;
}

/**
 * Calculates image priority for sorting profiles.
 *
 * Priority values:
 * - 1: Profile images (URLs starting with // or twitter profile images)
 * - 2: Other images
 * - 3: No image
 *
 * @param imageUrl - The raw image URL from the API
 * @returns Priority number (lower = higher priority)
 */
export function calculateImagePriority(
  imageUrl: string | null | undefined
): number {
  if (typeof imageUrl !== "string") {
    return 3;
  }

  // Check for profile-like images (protocol-relative URLs or Twitter images)
  if (
    imageUrl.startsWith("//") ||
    imageUrl.startsWith("http://pbs.twimg.com/")
  ) {
    return 1;
  }

  return 2;
}

// ============================================================================
// Slug Generation
// ============================================================================

/**
 * Generates a URL-friendly slug from a name.
 *
 * Uses the same options as the original Gridsome implementation
 * to ensure URL compatibility.
 *
 * @param name - The name to slugify
 * @returns URL-friendly slug
 */
export function generateSlug(name: string): string {
  return slugify(name, SLUGIFY_OPTIONS);
}

// ============================================================================
// Privacy Handling
// ============================================================================

/**
 * Checks if a profile should be hidden from the public directory.
 *
 * In Flex 2 API, the field is `isVisible` (positive logic).
 * We need to invert this for the `hide` check used in templates.
 *
 * @param portalPrivacy - The portal privacy settings from the API
 * @returns true if the profile should be hidden
 */
export function isProfileHidden(
  portalPrivacy: PortalPrivacy | undefined
): boolean {
  // If portalPrivacy is undefined, profile is visible (not hidden)
  if (portalPrivacy === undefined) {
    return false;
  }

  // Flex 2 API uses isVisible (positive logic)
  // If isVisible is explicitly false, the profile is hidden
  // If isVisible is undefined or true, the profile is visible
  if (portalPrivacy.isVisible === false) {
    return true;
  }

  return false;
}

/**
 * Extracts privacy options for template use.
 *
 * Converts Flex 2 API positive logic (showContactDetails, showSocialProfiles)
 * to template negative logic (hideContactDetails, hidePublicProfiles).
 *
 * @param portalPrivacy - The portal privacy settings from the API
 * @returns Privacy options with inverted boolean values
 */
export function extractPrivacyOptions(
  portalPrivacy: PortalPrivacy | undefined
): TransformedPrivacy {
  if (portalPrivacy === undefined) {
    return {
      hideContactDetails: false,
      hidePublicProfiles: false,
    };
  }

  return {
    // Invert: showContactDetails -> hideContactDetails
    hideContactDetails: portalPrivacy.showContactDetails === false,
    // Invert: showSocialProfiles -> hidePublicProfiles
    hidePublicProfiles: portalPrivacy.showSocialProfiles === false,
  };
}

// ============================================================================
// SDG Extraction
// ============================================================================

/**
 * Extracts SDG (Sustainable Development Goals) from properties.
 *
 * @param properties - The custom properties object from the API
 * @returns Array of SDG strings (empty array if none)
 */
export function extractSDGs(properties: ApiProperties | undefined): string[] {
  if (properties === undefined) {
    return [];
  }

  if (Array.isArray(properties.sdg) && properties.sdg.length > 0) {
    return properties.sdg;
  }

  return [];
}

// ============================================================================
// Social Profiles
// ============================================================================

/**
 * Normalizes social profiles from API response.
 *
 * Handles both new socialProfiles object and legacy fields
 * (twitterHandle, linkedin) for backward compatibility.
 *
 * @param socialProfiles - The socialProfiles object from the API
 * @param legacyTwitter - Legacy twitterHandle field
 * @param legacyLinkedin - Legacy linkedin field
 * @returns Normalized social profiles object
 */
export function normalizeSocialProfiles(
  socialProfiles: SocialProfiles | undefined,
  legacyTwitter?: string,
  legacyLinkedin?: string
): SocialProfiles {
  const result: SocialProfiles = {};

  // Prefer new socialProfiles object, fall back to legacy fields
  result.twitter = socialProfiles?.twitter ?? legacyTwitter;
  result.linkedin = socialProfiles?.linkedin ?? legacyLinkedin;
  result.instagram = socialProfiles?.instagram;
  result.facebook = socialProfiles?.facebook;

  return result;
}

// ============================================================================
// URL Fixing
// ============================================================================

/**
 * Fixes URLs that are missing the protocol.
 *
 * @param url - The URL to fix
 * @returns URL with protocol, or undefined if no URL provided
 */
export function fixUrl(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  if (url.startsWith("http")) {
    return url;
  }

  return "//" + url;
}

// ============================================================================
// Main Transformation Functions
// ============================================================================

/**
 * Transforms a raw API member into the format needed for templates.
 *
 * @param member - Raw member data from the API
 * @returns Transformed member data, or null if the profile should be hidden
 */
export function transformMember(member: ApiMember): TransformedMember | null {
  // Filter out hidden profiles
  if (isProfileHidden(member.portalPrivacy)) {
    return null;
  }

  // Ensure team data exists
  if (!member.team) {
    // Skip members without team data
    return null;
  }

  const slug = generateSlug(member.name);
  const teamSlug = generateSlug(member.team.name);
  const image = transformImageUrl(member.image);
  const priority = calculateImagePriority(member.image);
  const privacy = extractPrivacyOptions(member.portalPrivacy);
  const sdgs = extractSDGs(member.properties);
  const socialProfiles = normalizeSocialProfiles(
    member.socialProfiles,
    member.twitterHandle,
    member.linkedin
  );

  return {
    slug,
    name: member.name,
    email: member.email,
    phone: member.phone,
    image,
    priority,
    tags: member.tags,
    created: member.createdAt,
    bio: member.description,
    sdgs,
    socialProfiles,
    privacy,
    teamName: member.team.name,
    teamSlug,
  };
}

/**
 * Transforms a raw API company into the format needed for templates.
 *
 * @param company - Raw company data from the API
 * @param members - Array of raw members to find team members
 * @returns Transformed company data, or null if the profile should be hidden
 */
export function transformCompany(
  company: ApiCompany,
  members: ApiMember[]
): TransformedCompany | null {
  // Filter out hidden profiles
  if (isProfileHidden(company.portalPrivacy)) {
    return null;
  }

  const slug = generateSlug(company.name);
  const image = transformImageUrl(company.image);
  const priority = calculateImagePriority(company.image);
  const privacy = extractPrivacyOptions(company.portalPrivacy);
  const sdgs = extractSDGs(company.properties);
  const socialProfiles = normalizeSocialProfiles(
    company.socialProfiles,
    company.twitterHandle
  );
  const url = fixUrl(company.url);

  // Find team members for this company
  const teamMembers: TeamMemberReference[] = [];
  for (const member of members) {
    // Skip hidden members
    if (isProfileHidden(member.portalPrivacy)) {
      continue;
    }

    // Check if member belongs to this company
    if (member.team?._id === company._id) {
      teamMembers.push({
        name: member.name,
        slug: generateSlug(member.name),
      });
    }
  }

  return {
    slug,
    name: company.name,
    created: company.startDate,
    bio: company.description,
    url,
    image,
    sdgs,
    priority,
    socialProfiles,
    privacy,
    teamMembers,
  };
}

// ============================================================================
// Batch Transformation
// ============================================================================

/**
 * Transforms all members, filtering out hidden profiles.
 *
 * @param members - Array of raw members from the API
 * @returns Array of transformed members (hidden profiles filtered out)
 */
export function transformAllMembers(members: ApiMember[]): TransformedMember[] {
  const result: TransformedMember[] = [];

  for (const member of members) {
    const transformed = transformMember(member);
    if (transformed !== null) {
      result.push(transformed);
    }
  }

  return result;
}

/**
 * Transforms all companies, filtering out hidden profiles.
 *
 * @param companies - Array of raw companies from the API
 * @param members - Array of raw members for team member lookup
 * @returns Array of transformed companies (hidden profiles filtered out)
 */
export function transformAllCompanies(
  companies: ApiCompany[],
  members: ApiMember[]
): TransformedCompany[] {
  const result: TransformedCompany[] = [];

  for (const company of companies) {
    const transformed = transformCompany(company, members);
    if (transformed !== null) {
      result.push(transformed);
    }
  }

  return result;
}
