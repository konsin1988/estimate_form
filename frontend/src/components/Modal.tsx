import React from "react";

export default function Modal({ isOpen, onClose, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-100">
						<div className="bg-white p-6 rounded-xl shadow-xl min-w-80 max-w-120 text-center z-101">
						    <p className="text-lg mb-4 text-gray-600">{ message }</p>

						    <button
								    onClick={onClose}
								    className="px-5 py-1 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 transition"
						    >
								Ok
								</button>
						</div>
				</div>
    );
}
