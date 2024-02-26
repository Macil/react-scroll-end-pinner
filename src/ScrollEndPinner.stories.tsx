import type { Meta, StoryObj } from "@storybook/react";

import { ScrollEndPinner, ScrollEndPinnerProps } from "./ScrollEndPinner";
import { useEffect, useState } from "react";

interface Props {
  scrollBehavior?: ScrollEndPinnerProps["scrollBehavior"];
}

function ScrollEndPinnerStory(props: Props) {
  const COUNT_START = 10;
  const COUNT_MAX = 60;
  const [count, setCount] = useState(COUNT_START);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => (c >= COUNT_MAX ? COUNT_START : c + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div>
      <div>
        Every second, one message will be added to the bottom of the list. The
        list will reset once it has {COUNT_MAX} messages.
      </div>
      <ScrollEndPinner
        {...props}
        style={{ height: "300px", width: "400px", background: "#ddd" }}
      >
        {new Array(count).fill(null).map((_value, i) => (
          <div key={i} style={{ border: "1px solid black", margin: "4px" }}>
            content {i}
          </div>
        ))}
      </ScrollEndPinner>
    </div>
  );
}

const meta: Meta<typeof ScrollEndPinnerStory> = {
  component: ScrollEndPinnerStory,
  argTypes: {
    scrollBehavior: {
      control: {
        type: "radio",
      },
      options: ["auto", "smooth", "instant"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ScrollEndPinnerStory>;

export const Primary: Story = {};
