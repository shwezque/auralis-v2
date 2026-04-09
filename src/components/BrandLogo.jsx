import { useState } from 'react'

/**
 * Renders a brand's logo image, falling back to a styled lettermark
 * if the image is absent or fails to load.
 *
 * Props:
 *   brand     — brand object from brands.js
 *   className — additional classes applied to both image and lettermark
 *   fontSize  — override lettermark font size (default '1.1rem')
 */
export default function BrandLogo({ brand, className = '', fontSize = '1.1rem' }) {
  const [errored, setErrored] = useState(false)

  const logoSrc = brand.logo || brand.avatar
  if (logoSrc && !errored) {
    return (
      <img
        src={logoSrc}
        alt={brand.brandName}
        className={`object-contain ${className}`}
        onError={() => setErrored(true)}
      />
    )
  }

  // Lettermark fallback — flex so it properly fills the parent container
  return (
    <span
      className={`flex items-center justify-center font-bold font-display leading-none select-none ${className}`}
      style={{ color: brand.colors.from, fontSize }}
    >
      {brand.brandInitial}
    </span>
  )
}
