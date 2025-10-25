import React from "react";

function PetInfo({ pets, setShowModal, currentPetIndex, setCurrentPetIndex }) {
  return (
    <div className="p-4 rounded-2xl bg-white shadow-[0_0_15px_rgba(0,0,0,0.2)] h-[220px] flex items-center justify-center relative">
      {pets.length === 0 ? (
        <div className="p-5 bg-[#EEF4F5] rounded-xl flex flex-row justify-around items-center w-full h-full">
          <div className="w-32">
            <img src="/images/sad-dog.png" alt="sad dog" />
          </div>
          <div className="flex flex-col">
            <div className="text-left flex flex-col gap-2">
              <span className="font-[700]">No pets on your account.</span>
              <span className="text-[15px]">
                If you have a pet registered, you should see their information here.
              </span>
            </div>
            <div className="text-right mt-5">
              <button
                onClick={() => setShowModal(true)}
                className="relative bg-white py-2 px-6 text-[13px] font-semibold text-gray-700 rounded-lg border border-[#5EE6FE] shadow-sm transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_4px_15px_rgba(94,230,254,0.4)] hover:bg-[#5EE6FE] hover:text-white active:translate-y-[1px]"
              >
                Add my pet
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full bg-[#F9FBFB] rounded-xl border border-[#E6F5F7] shadow-inner flex flex-col sm:flex-row items-center justify-between gap-5 px-6 py-4 transition-all duration-300 overflow-hidden">
          <div className="flex justify-center sm:justify-start w-full sm:w-auto">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-[#5EE6FE] shadow-md flex-shrink-0 transition-transform duration-300 hover:scale-[1.05]">
              <img
                src={pets[currentPetIndex]?.photo || pets[pets.length - 1].photo}
                alt={pets[currentPetIndex]?.name || pets[pets.length - 1].name}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              <div className="absolute inset-0 rounded-full border-2 border-[#5EE6FE]/40 animate-pulse-slow"></div>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center sm:items-start text-center sm:text-left gap-1 sm:gap-2 flex-1 transition-opacity duration-500">
            <h3 className="font-[700] text-lg sm:text-xl text-[#2E2E2E] tracking-wide">
              {pets[currentPetIndex]?.name || pets[pets.length - 1].name}
            </h3>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-10 gap-1 sm:gap-2 text-[15px] text-[#444] leading-tight">
              <p>
                <b>Breed:</b> {pets[currentPetIndex]?.breed || pets[pets.length - 1].breed || "—"}
              </p>
              <p>
                <b>Age:</b> {pets[currentPetIndex]?.age || pets[pets.length - 1].age || "—"}
              </p>
              <p>
                <b>Gender:</b> {pets[currentPetIndex]?.gender || pets[pets.length - 1].gender || "—"}
              </p>
            </div>
          </div>

          {pets.length > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-3">
              <button
                onClick={() =>
                  setCurrentPetIndex((prevIndex) => (prevIndex - 1 + pets.length) % pets.length)
                }
                className="bg-[#5EE6FE] text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-[#3ecbe0] hover:shadow-lg transition-all duration-300"
              >
                <i className="fa-solid fa-chevron-left text-sm"></i>
              </button>
              <button
                onClick={() => setCurrentPetIndex((prevIndex) => (prevIndex + 1) % pets.length)}
                className="bg-[#5EE6FE] text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-[#3ecbe0] hover:shadow-lg transition-all duration-300"
              >
                <i className="fa-solid fa-chevron-right text-sm"></i>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PetInfo;
