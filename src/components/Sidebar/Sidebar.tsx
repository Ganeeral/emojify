import { useClickAway } from "react-use";
import { useRef } from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sling as Hamburger } from "hamburger-react";
import Link from "next/link";

const data = [
  { id: 1, name: "Анимоджи", href: "#preview" },
  { id: 2, name: "О проекте", href: "#about" },
  { id: 3, name: "Как работает?", href: "#work" },
  { id: 4, name: "Демо", href: "#demo" },
];

export const SidebarAbout = () => {
  const [isOpen, setOpen] = useState(false);
  const ref = useRef(null);

  useClickAway(ref, () => setOpen(false));

  return (
    <div className="block mobile:hidden transition-all duration-300">
      <Hamburger toggled={isOpen} toggle={setOpen} size={24} color="white" />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 shadow-4xl right-0 top-[8.5rem] p-5 z-50 backdrop-blur-2xl border-b border-b-white/20"
          >
            <ul className="grid gap-2">
              {data.map((item) => {
                return (
                  <motion.li
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.1 / 10,
                    }}
                    key={item.name}
                    className="w-full p-[0.08rem] rounded-xl bg-gradient-to-tr from-neutral-700 via-neutral-950 to-neutral-700"
                  >
                    <Link
                      onClick={() => setOpen((prev) => !prev)}
                      className={
                        "flex items-center justify-between w-full p-5 rounded-xl bg-backgroundAbout text-white"
                      }
                      href={item.href}
                    >
                      <span className="flex gap-1 Inter font-semibold text-lg">{item.name}</span>
                    </Link>
                  </motion.li>
                );
              })}
              <motion.li
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1 / 10,
                }}
                className="w-full mt-4 flex justify-center"
              ></motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
