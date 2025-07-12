"use client"
interface PopUpProps {
  onSelect: (type: string) => void
  onClose: () => void
}

export default function PopUp({ onSelect, onClose }: PopUpProps) {
  const items = [
    {
      id: 1,
      icon: "/icon/news.jpg",
      title: "News Style",
      type: "News"
    },
    {
      id: 2,
      icon: "/icon/element-2.jpg",
      title: "Element Style",
      type: "Banner"
    },
    {
      id: 3,
      icon: "/icon/element1.jpg",
      title: "Element 2",
      type: "ContentWithImage"
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Layout Section</h2>
        
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelect(item.type)
                onClose()
              }}
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50"
            >
              <img 
                src={item.icon} 
                alt={item.title} 
                className="w-12 h-12 object-cover mr-4"
              />
              <span className="text-lg font-medium">{item.title}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}