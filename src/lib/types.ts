/**
 * TypeScript interfaces for OfficeRnD Flex 2 API and transformed data.
 *
 * API interfaces match the Flex 2 API documentation:
 * https://developer.officernd.com/reference/memberscontroller_getitems
 * https://developer.officernd.com/reference/companiescontroller_getitems
 */

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Member status values from the Flex 2 API
 */
export type MemberStatus =
  | "active"
  | "former"
  | "pending"
  | "contact"
  | "not_approved"
  | "drop-in"
  | "lead";

/**
 * Company status values from the Flex 2 API
 */
export type CompanyStatus = "active" | "former" | "pending" | "lead";

// ============================================================================
// Shared API Interfaces
// ============================================================================

/**
 * Address structure used in API responses
 */
export interface ApiAddress {
  country?: string;
  state?: string;
  city?: string;
  street?: string;
  zip?: string;
}

/**
 * Social profiles object - replaces legacy twitterHandle/linkedin fields
 */
export interface SocialProfiles {
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
}

/**
 * Portal privacy settings from the API
 *
 * Note: The Flex 2 API uses different field names than the legacy API.
 * - `isVisible` replaces the old `hide` field (inverted logic)
 * - `showContactDetails` replaces `hideContactDetails` (inverted logic)
 * - `showSocialProfiles` replaces `hidePublicProfiles` (inverted logic)
 */
export interface PortalPrivacy {
  isVisible?: boolean;
  showContactDetails?: boolean;
  showSocialProfiles?: boolean;
}

/**
 * Billing details structure
 */
export interface ApiBillingDetails {
  billingName?: string;
  vatNumber?: string;
  registrationNumber?: string;
  paymentMethod?: string;
  billingAddress?: ApiAddress;
}

/**
 * Custom properties object - can contain SDG data and other custom fields
 */
export interface ApiProperties {
  sdg?: string[];
  [key: string]: unknown;
}

// ============================================================================
// API Response Interfaces - Raw data from Flex 2 API
// ============================================================================

/**
 * Raw member object from the Flex 2 API
 *
 * @see https://developer.officernd.com/reference/memberscontroller_getitems
 */
export interface ApiMember {
  // Required fields
  _id: string;
  name: string;
  location: string;
  status: MemberStatus;
  startDate: string;

  // Optional fields
  email?: string;
  phone?: string;
  image?: string | null;
  description?: string;
  company?: string;
  isBillingPerson?: boolean;
  isContactPerson?: boolean;
  properties?: ApiProperties;
  tags?: string[];
  createdAt?: string;
  modifiedAt?: string;

  // Nested objects
  address?: ApiAddress;
  billingAddress?: ApiAddress;
  billingDetails?: ApiBillingDetails;
  portalPrivacy?: PortalPrivacy;
  socialProfiles?: SocialProfiles;

  // Legacy fields (may still be present in some responses)
  /** @deprecated Use socialProfiles.twitter instead */
  twitterHandle?: string;
  /** @deprecated Use socialProfiles.linkedin instead */
  linkedin?: string;

  // Team reference - may be embedded or just an ID
  team?: {
    _id: string;
    name: string;
  };
}

/**
 * Raw company (team) object from the Flex 2 API
 *
 * @see https://developer.officernd.com/reference/companiescontroller_getitems
 */
export interface ApiCompany {
  // Required fields
  _id: string;
  name: string;
  location: string;
  startDate: string;

  // Optional fields
  description?: string;
  email?: string;
  image?: string | null;
  url?: string;
  status?: CompanyStatus;
  hasActiveMembersAllowance?: boolean;
  activeMembersAllowanceLimit?: number;
  properties?: ApiProperties;
  tags?: string[];
  createdAt?: string;
  createdBy?: string;
  modifiedAt?: string;
  modifiedBy?: string;

  // Nested objects
  address?: ApiAddress;
  billingDetails?: ApiBillingDetails;
  portalPrivacy?: PortalPrivacy;
  socialProfiles?: SocialProfiles;

  // Legacy fields (may still be present in some responses)
  /** @deprecated Use socialProfiles.twitter instead */
  twitterHandle?: string;
}

/**
 * Paginated response wrapper from the Flex 2 API
 */
export interface ApiPaginatedResponse<T> {
  rangeStart: number;
  rangeEnd: number;
  cursorNext?: string;
  cursorPrev?: string;
  results: T[];
}

// ============================================================================
// Transformed Data Interfaces - Processed data for templates
// ============================================================================

/**
 * Privacy options for transformed data
 * Uses the legacy field names for backward compatibility with templates
 */
export interface TransformedPrivacy {
  hideContactDetails: boolean;
  hidePublicProfiles: boolean;
}

/**
 * Team member reference for company member lists
 */
export interface TeamMemberReference {
  name: string;
  slug: string;
}

/**
 * Transformed member data for use in Astro templates
 *
 * This interface represents the processed member data after:
 * - Filtering hidden profiles
 * - Generating slugs
 * - Processing images through ImageKit
 * - Extracting SDG data
 * - Normalizing privacy settings
 */
export interface TransformedMember {
  slug: string;
  name: string;
  email?: string;
  phone?: string;
  image: string;
  priority: number;
  tags?: string[];
  created?: string;
  bio?: string;
  sdgs: string[];
  socialProfiles: SocialProfiles;
  privacy: TransformedPrivacy;
  teamName: string;
  teamSlug: string;
}

/**
 * Transformed company data for use in Astro templates
 *
 * This interface represents the processed company data after:
 * - Filtering hidden profiles
 * - Generating slugs
 * - Processing images through ImageKit
 * - Extracting SDG data
 * - Fixing URLs
 * - Collecting team members
 */
export interface TransformedCompany {
  slug: string;
  name: string;
  created?: string;
  bio?: string;
  url?: string;
  image: string;
  sdgs: string[];
  priority: number;
  socialProfiles: SocialProfiles;
  privacy: TransformedPrivacy;
  teamMembers: TeamMemberReference[];
}

// ============================================================================
// Collection Types - For Astro content collections
// ============================================================================

/**
 * Member collection entry
 */
export interface MemberCollectionEntry {
  id: string;
  data: TransformedMember;
}

/**
 * Company collection entry
 */
export interface CompanyCollectionEntry {
  id: string;
  data: TransformedCompany;
}
