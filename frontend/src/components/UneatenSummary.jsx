export function CookedMealsSummary({ cookedMeals }) {
    const totalServings = Object.values(cookedMeals).reduce((sum, servings) => sum + servings, 0);

    return (
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-4 shadow-lg border-2 border-green-200">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🥘</span>
                <h2 className="text-xl font-bold text-green-800">Cooked Meals Ready to Eat</h2>
                <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                    {totalServings} servings
                </span>
            </div>

            {Object.keys(cookedMeals).length === 0 ? (
                <div className="text-center py-6 text-green-600">
                    <span className="text-3xl block mb-2">�️</span>
                    <p>No cooked meals yet! Start cooking to see them here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(cookedMeals).map(([mealName, servings]) => (
                        <div
                            key={mealName}
                            className="bg-white rounded-lg p-3 border-2 border-green-200 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">🍲</span>
                                    <span className="font-medium text-green-800">{mealName}</span>
                                </div>
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                                    {servings} left
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}