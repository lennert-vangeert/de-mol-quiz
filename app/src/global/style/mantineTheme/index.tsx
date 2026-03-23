import type {
  MantineBreakpointsValues,
  MantineThemeOverride,
} from "@mantine/core";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import type * as React from "react";

const colors = {
  text: "#1E1A16",
  white: "#FFFFFF",
  black: "#111827",
  dark: "#374022",
  medium: "#4F5A32",
  light: "#6C7650",
  mainBackground: "#F6F1E8",
  backgroundTransparent: "transparent",
  warning: "#D3A45B",
  default: {
    primary: "#4F5A32",
    hover: "#374022",
    focus: "#4F5A32",
    active: "#2D341C",
    disabled: "#D1D5DB",
  },
};

const breakpoints: MantineBreakpointsValues = {
  xs: "20rem",
  sm: "36rem",
  md: "48rem",
  lg: "58.75rem",
  xl: "87.5rem",
};

const spacing: MantineBreakpointsValues = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.25rem",
  xl: "1.5rem",
};

const borderRadii = {
  button: "4px",
  input: "4px",
};

const borderWidths = {
  buttonOutlineVariant: "2px",
  input: "1px",
};

const theme: MantineThemeOverride = {
  primaryColor: "default",
  primaryShade: 5,
  white: colors.white,
  black: colors.black,
  colors: {
    default: [
      colors.default.disabled,
      "#E7D9C5",
      "#D8C3A5",
      "#C3AA84",
      colors.default.focus,
      colors.default.primary,
      colors.default.hover,
      colors.default.active,
      "#212715",
      "#171B0F",
    ],
    error: [
      "#ffebee",
      "#fbd8da",
      "#edb0b3",
      "#df858a",
      "#d46167",
      "#cd4950",
      "#cb3d45",
      "#b42f36",
      "#a1262f",
      "#8e1c26",
    ],
    success: [
      "#f3faed",
      "#e8f0de",
      "#cfe1bc",
      "#b4cf97",
      "#9ec078",
      "#90b764",
      "#88b458",
      "#759e47",
      "#678c3e",
      "#567930",
    ],
  },
  fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
  fontSizes: {
    xs: "0.6875rem",
    sm: "0.875rem",
    md: "0.875rem",
    lg: "1rem",
    xl: "1.25rem",
  },
  lineHeights: {
    xs: "1.4",
    sm: "1.45",
    md: "1.5",
    lg: "1.6",
    xl: "1.65",
  },
  headings: {
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
    textWrap: "wrap",
    sizes: {
      h1: {
        fontSize: "2.25rem",
        fontWeight: "900",
        lineHeight: "1.5",
      },
      h2: {
        fontSize: "2rem",
        fontWeight: "900",
        lineHeight: "1.5",
      },
      h3: {
        fontSize: "1.75rem",
        fontWeight: "900",
        lineHeight: "1.5",
      },
      h4: {
        fontSize: "1.5rem",
        fontWeight: "900",
        lineHeight: "1.5",
      },
      h5: {
        fontSize: "1.25rem",
        fontWeight: "900",
        lineHeight: "1.5",
      },
      h6: {
        fontSize: "1rem",
        fontWeight: "900",
        lineHeight: "1.5",
      },
    },
  },
  spacing,
  breakpoints,
  focusRing: "auto",
  defaultRadius: borderRadii.input,
  components: {
    Input: {
      styles: {
        input: {
          borderWidth: borderWidths.input,
          borderColor: "#D8C7AE",
          backgroundColor: colors.white,
          color: colors.text,
        },
        invalid: {
          color: "error",
        },
      },
    },
    Checkbox: {
      styles: {
        input: {
          borderWidth: borderWidths.input,
          borderColor: "#B9A78B",
        },
      },
    },
    Radio: {
      styles: {
        radio: {
          borderWidth: borderWidths.input,
          borderColor: "#B9A78B",
        },
      },
    },
    Button: {
      styles: {
        root: {
          borderRadius: borderRadii.button,
        },
        outline: {
          borderRadius: borderRadii.button,
          borderImage: borderWidths.buttonOutlineVariant,
        },
      },
    },
    Modal: {
      styles: {
        header: {
          left: 0,
          right: 0,
        },
        title: {
          fontWeight: "bold",
          fontSize: "1.375rem",
          lineHeight: "1.5",
        },
        body: {
          minWidth: "15rem",
        },
      },
    },
    AppShell: {
      styles: {
        main: {
          minWidth: breakpoints.xs,
          backgroundColor: colors.mainBackground,
          color: colors.text,
        },
      },
    },
    Paper: {
      styles: {
        root: {
          backgroundColor: "#FFFDF9",
          borderColor: "#E2D2BB",
        },
      },
    },
    Table: {
      styles: {
        th: {
          color: colors.dark,
          backgroundColor: "#F2E8D9",
        },
      },
    },
  },
};

type MantineStylesProps = {
  children: React.ReactNode;
};

export const MantineStyles = ({ children }: MantineStylesProps) => (
  <MantineProvider theme={theme}>
    <ModalsProvider>{children}</ModalsProvider>
  </MantineProvider>
);
