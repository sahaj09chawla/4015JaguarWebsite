import React from "react";

const ScreenBlocker: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-gray-100">
            <h1 className="text-2xl font-bold text-red-600">Website Not Available</h1>
            <p className="mt-4 text-gray-700">
                This website is currently under development for mobile and tablet devices.
                <br />
                Please visit on a laptop or desktop computer.
            </p>
        </div>
    );
};

export default ScreenBlocker;
