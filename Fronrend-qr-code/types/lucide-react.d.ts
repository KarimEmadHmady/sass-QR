declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';

  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    strokeWidth?: number | string;
  }

  export const Star: FC<IconProps>;
  export const Utensils: FC<IconProps>;
  export const Clock: FC<IconProps>;
  export const Search: FC<IconProps>;
  export const Menu: FC<IconProps>;
  export const X: FC<IconProps>;
} 