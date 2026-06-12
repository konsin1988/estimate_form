import React from "react";

export default function Modal({ isOpen, onClose, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-100">
						<div className="bg-white p-6 rounded-2xl shadow-xl w-80 text-center z-101">
						    <p className="text-lg mb-4 text-gray-600">{ message }</p>

						    <button
								    onClick={onClose}
								    className="px-5 py-2 bg-gray-400 text-gray-100 rounded-xl hover:bg-gray-700 transition"
						    >
								Ok
								</button>
						</div>
				</div>
    );
}
