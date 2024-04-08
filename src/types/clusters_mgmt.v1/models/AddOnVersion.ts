/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdditionalCatalogSource } from './AdditionalCatalogSource';
import type { AddOnConfig } from './AddOnConfig';
import type { AddOnParameter } from './AddOnParameter';
import type { AddOnRequirement } from './AddOnRequirement';
import type { AddOnSubOperator } from './AddOnSubOperator';
/**
 * Representation of an add-on version.
 */
export type AddOnVersion = {
  /**
   * Indicates the type of this object. Will be 'AddOnVersion' if this is a complete object or 'AddOnVersionLink' if it is just a link.
   */
  kind?: string;
  /**
   * Unique identifier of the object.
   */
  id?: string;
  /**
   * Self link.
   */
  href?: string;
  /**
   * Additional catalog sources associated with this addon version
   */
  additional_catalog_sources?: Array<AdditionalCatalogSource>;
  /**
   * AvailableUpgrades is the list of versions this version can be upgraded to.
   */
  available_upgrades?: Array<string>;
  /**
   * The specific addon catalog source channel of packages
   */
  channel?: string;
  /**
   * Additional configs to be used by the addon once its installed in the cluster.
   */
  config?: AddOnConfig;
  /**
   * Indicates if this add-on version can be added to clusters.
   */
  enabled?: boolean;
  /**
   * The package image for this addon version
   */
  package_image?: string;
  /**
   * List of parameters for this add-on version.
   */
  parameters?: Array<AddOnParameter>;
  /**
   * The pull secret name used for this addon version.
   */
  pull_secret_name?: string;
  /**
   * List of requirements for this add-on version.
   */
  requirements?: Array<AddOnRequirement>;
  /**
   * The catalog source image for this add-on version.
   */
  source_image?: string;
  /**
   * List of sub operators for this add-on version.
   */
  sub_operators?: Array<AddOnSubOperator>;
};
