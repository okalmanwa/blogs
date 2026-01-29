/**
 * Utility functions for handling image URLs in blog content
 */

// Regex to detect image URLs (common image extensions)
const IMAGE_URL_REGEX = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?[^\s]*)?)/gi

/**
 * Processes content to format paragraphs and images properly
 */
export function processImageUrls(content: string): string {
  let processed = content

  // Check if content already has HTML tags
  const hasHtml = processed.includes('<p>') || processed.includes('<div>') || processed.includes('<img')

  if (!hasHtml) {
    // Convert content to HTML with proper paragraph handling
    // Split by double newlines (paragraph breaks)
    const paragraphs = processed.split(/\n\s*\n/).filter(p => p.trim())
    
    processed = paragraphs
      .map(para => {
        const trimmed = para.trim()
        if (!trimmed) return ''
        
        // Check if paragraph contains image URLs
        if (IMAGE_URL_REGEX.test(trimmed)) {
          // Split by image URLs to handle text and images separately
          const parts: string[] = []
          let lastIndex = 0
          let match: RegExpExecArray | null
          
          // Reset regex
          IMAGE_URL_REGEX.lastIndex = 0
          
          while ((match = IMAGE_URL_REGEX.exec(trimmed)) !== null) {
            // Add text before image
            if (match.index > lastIndex) {
              const textBefore = trimmed.substring(lastIndex, match.index).trim()
              if (textBefore) {
                parts.push(`<p class="mb-6 leading-[1.7]">${textBefore.replace(/\n/g, '<br>')}</p>`)
              }
            }
            
            // Check for caption text after image
            // Support formats:
            // 1. Image URL on one line, caption on next line (before double newline)
            // 2. Markdown-style: ![caption](image-url)
            const afterImage = trimmed.substring(IMAGE_URL_REGEX.lastIndex).trim()
            
            // Try markdown format first: ![caption](url)
            const markdownMatch = trimmed.match(/!\[([^\]]*)\]\(([^)]+)\)/)
            let caption: string | null = null
            let captionMatch: RegExpMatchArray | null = null
            
            if (markdownMatch && markdownMatch[2] === match[0]) {
              // This image URL is part of a markdown image
              caption = markdownMatch[1].trim() || null
            } else {
              // Try caption on next line (single line after image URL)
              captionMatch = afterImage.match(/^[\n\r]+(.+?)(?:\n\n|$)/)
              caption = captionMatch ? captionMatch[1].trim() : null
            }
            
            // Add image with border and optional caption
            if (caption) {
              parts.push(`<figure class="my-10">
                <div class="flex justify-center border-2 border-gray-200 rounded-lg p-2 bg-gray-50">
                  <img src="${match[0]}" alt="${caption}" class="max-w-full h-auto max-h-[500px] rounded object-contain" />
                </div>
                <figcaption class="text-center text-sm text-gray-600 mt-3 italic">${caption}</figcaption>
              </figure>`)
              lastIndex = IMAGE_URL_REGEX.lastIndex + (captionMatch ? (captionMatch.index || 0) + captionMatch[0].length : 0)
            } else {
              parts.push(`<figure class="my-10">
                <div class="flex justify-center border-2 border-gray-200 rounded-lg p-2 bg-gray-50">
                  <img src="${match[0]}" alt="Image" class="max-w-full h-auto max-h-[500px] rounded object-contain" />
                </div>
              </figure>`)
              lastIndex = IMAGE_URL_REGEX.lastIndex
            }
          }
          
          // Add remaining text after last image
          if (lastIndex < trimmed.length) {
            const textAfter = trimmed.substring(lastIndex).trim()
            if (textAfter) {
              parts.push(`<p class="mb-6 leading-[1.7]">${textAfter.replace(/\n/g, '<br>')}</p>`)
            }
          }
          
          return parts.join('\n')
        }
        
        // Regular paragraph - convert single newlines to <br>
        const withBreaks = trimmed.replace(/\n/g, '<br>')
        return `<p class="mb-6 leading-[1.7]">${withBreaks}</p>`
      })
      .join('\n')
  } else {
    // Content already has HTML - just process images
    // Process existing img tags - wrap them in figure with border
    processed = processed.replace(
      /<img\s+([^>]*?)>/gi,
      (match, attributes) => {
        // Skip if already wrapped in figure
        if (match.includes('<figure') || match.includes('figure')) {
          return match
        }
        
        // Extract existing class if any
        const classMatch = attributes.match(/class=["']([^"']+)["']/)
        let newClasses = 'max-w-full h-auto max-h-[500px] rounded object-contain'
        if (classMatch) {
          const existingClasses = classMatch[1]
          // Update classes
          newClasses = existingClasses
            .replace(/max-h-\[?\d+\]?px?/g, 'max-h-[500px]')
            .replace(/rounded-\w+/g, 'rounded')
            .replace(/shadow-\w+/g, '')
          if (!newClasses.includes('max-w-full')) {
            newClasses = `max-w-full h-auto ${newClasses}`.trim()
          }
          if (!newClasses.includes('object-contain')) {
            newClasses = `${newClasses} object-contain`.trim()
          }
          attributes = attributes.replace(/class=["'][^"']*["']/, '')
        }
        
        // Check for caption in alt attribute
        const altMatch = attributes.match(/alt=["']([^"']+)["']/)
        const altText = altMatch ? altMatch[1] : null
        
        // Build the figure with border
        let figureHtml = `<figure class="my-10">
          <div class="flex justify-center border-2 border-gray-200 rounded-lg p-2 bg-gray-50">
            <img ${attributes} class="${newClasses}" />`
        
        // Add caption if alt text exists and is not generic
        if (altText && altText !== 'Image' && altText !== 'image') {
          figureHtml += `
          </div>
          <figcaption class="text-center text-sm text-gray-600 mt-3 italic">${altText}</figcaption>
        </figure>`
        } else {
          figureHtml += `
          </div>
        </figure>`
        }
        
        return figureHtml
      }
    )

    // Handle standalone image URLs that aren't yet img tags (only if no img tags exist)
    if (!processed.includes('<img')) {
      // Reset regex
      IMAGE_URL_REGEX.lastIndex = 0
      const imageUrls: Array<{ url: string; index: number; caption?: string }> = []
      let match: RegExpExecArray | null
      
      while ((match = IMAGE_URL_REGEX.exec(processed)) !== null) {
        const url = match[0]
        const index = match.index
        
        // Check for markdown format: ![caption](url)
        const beforeMatch = processed.substring(0, index)
        const markdownPattern = new RegExp(`!\\[([^\\]]*)\\]\\(${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`)
        const markdownMatch = beforeMatch.match(markdownPattern)
        
        // Check for caption on next line
        const afterUrl = processed.substring(index + url.length)
        const captionMatch = afterUrl.match(/^[\n\r]+(.+?)(?:\n\n|$)/)
        
        let caption: string | undefined = undefined
        if (markdownMatch && markdownMatch[1]) {
          caption = markdownMatch[1].trim()
        } else if (captionMatch && captionMatch[1]) {
          caption = captionMatch[1].trim()
        }
        
        imageUrls.push({ url, index, caption })
      }
      
      // Replace from end to start to preserve indices
      for (let i = imageUrls.length - 1; i >= 0; i--) {
        const { url, index, caption } = imageUrls[i]
        const before = processed.substring(0, index)
        const after = processed.substring(index + url.length)
        
        // Don't convert if it's already in an img tag or link
        if (!before.includes(`<img`) && !before.includes(`href="${url}"`)) {
          const altText = caption || 'Image'
          let replacement = `\n<figure class="my-10">
            <div class="flex justify-center border-2 border-gray-200 rounded-lg p-2 bg-gray-50">
              <img src="${url}" alt="${altText}" class="max-w-full h-auto max-h-[500px] rounded object-contain" />
            </div>`
          
          if (caption) {
            replacement += `
            <figcaption class="text-center text-sm text-gray-600 mt-3 italic">${caption}</figcaption>`
          }
          
          replacement += `
          </figure>\n`
          
          processed = before + replacement + after
        }
      }
    }
  }

  return processed
}

/**
 * Checks if a string is a valid image URL
 */
export function isImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  
  const trimmed = url.trim()
  if (!trimmed) return false
  
  // First check with regex (more lenient, handles query params)
  // Reset regex lastIndex to avoid issues with global regex
  IMAGE_URL_REGEX.lastIndex = 0
  if (IMAGE_URL_REGEX.test(trimmed)) {
    return true
  }
  
  // Fallback: try URL parsing
  try {
    const urlObj = new URL(trimmed)
    const pathname = urlObj.pathname.toLowerCase()
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']
    return imageExtensions.some(ext => pathname.endsWith(ext))
  } catch {
    // If URL parsing fails, check if it looks like an image URL with regex
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?|$)/i.test(trimmed)
  }
}

/**
 * Extracts image URLs from text
 */
export function extractImageUrls(content: string): string[] {
  const matches = content.match(IMAGE_URL_REGEX)
  return matches || []
}
