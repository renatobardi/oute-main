import Button from './Button.svelte';

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'ghost'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
  },
};

export const Primary = {
  args: {
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary = {
  args: {
    variant: 'secondary',
    size: 'md',
  },
};

export const Danger = {
  args: {
    variant: 'danger',
    size: 'md',
  },
};

export const Ghost = {
  args: {
    variant: 'ghost',
    size: 'md',
  },
};
