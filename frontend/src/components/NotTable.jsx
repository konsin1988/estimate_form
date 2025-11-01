import React from "react";

export default function NotTable({ type }) {
    return (
	<>
	    <div className="w-screen h-screen flex items-center justify-center text-gray-600">
		{ type === 'loading' ? <h1>Loading..</h1> : 
		    <>
		    <h1>Ваша учетная запись не найдена.</h1>
		    </>
		}
	    </div>
	</>
    )
}
