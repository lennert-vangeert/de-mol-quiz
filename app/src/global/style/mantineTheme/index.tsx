import type {
  MantineBreakpointsValues,
  MantineThemeOverride,
} from "@mantine/core";
import { MantineProvider } from "@mantine/core";
import type * as React from "react";

// Color information
const colors = {
  text: "#021529",
  white: "#FFFFFF",
  black: "#000000",
  dark: "#293644",
  medium: "#6F7881",
  light: "#B9C2CC",
  mainBackground: "#FFFFFF", // Semantic white remains for components: change this for dark mode for example
  backgroundTransparent: "transparent",
  warning: "#FFD676",
  default: {
    primary: "#0A78F2",
    hover: "#1562B7",
    focus: "#489DFC",
    active: "#048C8C",
    disabled: "#E0E7F0",
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
  white: colors.mainBackground,
  black: colors.text,
  colors: {
    default: [
      colors.default.disabled,
      colors.default.hover,
      "#FFFF03",
      "#FFFF04",
      colors.default.focus,
      colors.default.primary,
      colors.default.hover,
      colors.default.primary,
      "#FFFF05",
      "#FFFF06",
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
  fontFamily: "Roboto, Helvetica",
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
    fontFamily: "Roboto, Helvetica",
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
          borderColor: colors.light,
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
          borderColor: colors.medium,
        },
      },
    },
    Radio: {
      styles: {
        radio: {
          borderWidth: borderWidths.input,
          borderColor: colors.medium,
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
        },
      },
    },
  },
};

type MantineStylesProps = {
  children: React.ReactNode;
};

export const MantineStyles = ({ children }: MantineStylesProps) => (
  <MantineProvider theme={theme}>{children}</MantineProvider>
);
