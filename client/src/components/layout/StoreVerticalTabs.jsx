"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { IconPackage } from "@tabler/icons-react";
import { fetchApi, cn } from "@/lib/utils";
import { useStoreType } from "@/context/StoreTypeContext";

export function StoreVerticalTabs({ className = "border-t" }) {
  const { activeStoreType, setActiveStoreType } = useStoreType();
  const [storeVerticals, setStoreVerticals] = useState([]);

  useEffect(() => {
    fetchApi("/public/store-verticals")
      .then((res) => setStoreVerticals(res.data?.storeVerticals || []))
      .catch(console.error);
  }, []);

  if (storeVerticals.length === 0) return null;

  return (
    <div className={cn("border-line bg-white", className)}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto flex items-center gap-2 sm:gap-2.5 h-12 overflow-x-auto no-scrollbar">
          {storeVerticals.map(({ id, name, image }) => {
            const active = activeStoreType === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveStoreType(active ? null : id)}
                aria-pressed={active}
                className={cn(
                  "relative flex items-center gap-2 pl-2 pr-3.5 sm:pl-2.5 sm:pr-4 py-1.5 text-[13px] sm:text-sm font-semibold whitespace-nowrap rounded-full border transition-all duration-200",
                  active
                    ? "text-white bg-pink border-pink shadow-md shadow-pink/30 scale-[1.04]"
                    : "text-noir/60 border-line/70 bg-white hover:text-pink hover:bg-pink-50/60 hover:border-pink/40"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full flex-shrink-0 overflow-hidden",
                    active ? "bg-white/20" : "bg-pink-50"
                  )}
                >
                  {image ? (
                    <Image
                      src={image}
                      alt=""
                      width={28}
                      height={28}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <IconPackage
                      className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", active ? "text-white" : "text-pink")}
                      stroke={1.8}
                    />
                  )}
                </span>
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StoreVerticalTabs;
