import React from "react";

const SearchSection = () => {
  return (
    <div className="flex justify-center items-center flex-col h-full">
      <h4 className="clamp-text Inter font-bold">
       <span className="gradientText ">Emojify AI</span>{" "}
      </h4>
      <form
        className="flex items-center bg-[#312E2F] max-w-[1100px] mt-24 rounded-3xl w-full"
        action=""
      >
        <input
          className="placeholder text-xl text-[#AFAFAF] max-w-[1100px] rounded-3xl px-8 py-6 w-full placeholder:text-xl Inter font-bold bg-inherit outline-none"
          type="search"
          placeholder="Введите сцену..."
        />
        <button className=" bg-[#171717] px-7 py-6 z-10 rounded-3xl">
          <p className="gradientTextAnimation text-[22px]">Emojify</p>
        </button>
      </form>
    </div>
  );
};

export default SearchSection;
