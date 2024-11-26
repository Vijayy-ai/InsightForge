interface HoverTemplateOptions {
  x?: string | number;
  y?: string | number;
  label?: string;
  value?: number | string;
  customFields?: Record<string, any>;
}

export const generateHoverTemplate = (options: HoverTemplateOptions): string => {
  const {
    x,
    y,
    label,
    value,
    customFields = {}
  } = options;

  let template = '<div class="hover-template">';

  if (label) {
    template += `<b>${label}</b><br>`;
  }

  if (x !== undefined) {
    template += `X: ${x}<br>`;
  }

  if (y !== undefined) {
    template += `Y: ${y}<br>`;
  }

  if (value !== undefined) {
    template += `Value: ${value}<br>`;
  }

  // Add any custom fields
  Object.entries(customFields).forEach(([key, val]) => {
    template += `${key}: ${val}<br>`;
  });

  template += '</div>';

  return template;
}; 