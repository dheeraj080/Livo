import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

const EditableNode = ({ data, id, selected }) => {
  return (
    <div
      className={`
      group min-w-[150px] p-4 rounded-2xl shadow-2xl transition-all
      bg-white dark:bg-[#1c1c1e] 
      border-2 ${selected ? "border-[#d4a017]" : "border-zinc-200 dark:border-white/10"}
    `}
    >
      {/* Input Handles for connecting */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[#d4a017] !w-3 !h-3"
      />

      <textarea
        defaultValue={data.label}
        onChange={(evt) => data.onChange(id, evt.target.value)}
        className="w-full bg-transparent outline-none resize-none text-zinc-900 dark:text-white font-medium text-center placeholder:text-zinc-400"
        rows={2}
        placeholder="Type a thought..."
      />

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[#d4a017] !w-3 !h-3"
      />
    </div>
  );
};

export default memo(EditableNode);
