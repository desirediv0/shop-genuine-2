import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { storeVerticals } from "@/api/adminService";
import { useDropzone } from "react-dropzone";
import {
  Edit,
  Trash2,
  Loader2,
  Search,
  Plus,
  Package,
  MoreVertical,
} from "lucide-react";
import { getImageUrl } from "@/utils/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface StoreVertical {
  id: string;
  name: string;
  slug: string;
  image: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

export default function StoreVerticalsPage() {
  const [list, setList] = useState<StoreVertical[]>([]);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<StoreVertical | null>(null);
  const [form, setForm] = useState({
    name: "",
    image: null as File | null,
    order: 0,
    isActive: true,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStoreVerticals = async () => {
    try {
      setIsLoading(true);
      const res = await storeVerticals.getStoreVerticals();
      setList(res.data.data.storeVerticals || []);
    } catch (err) {
      toast.error("Failed to fetch store verticals");
      console.error("Error fetching store verticals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreVerticals();
  }, []);

  const filteredList = list.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setForm((prev) => ({ ...prev, image: acceptedFiles[0] }));
      setImagePreview(URL.createObjectURL(acceptedFiles[0]));
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || (!form.image && !imagePreview)) {
      toast.error("Name and image are required");
      return;
    }
    setCreating(true);
    try {
      if (editItem) {
        await storeVerticals.updateStoreVertical(editItem.id, {
          name: form.name,
          image: form.image || undefined,
          order: form.order,
          isActive: form.isActive,
        });
        toast.success("Store vertical updated successfully");
      } else {
        await storeVerticals.createStoreVertical({
          name: form.name,
          image: form.image!,
          order: form.order,
          isActive: form.isActive,
        });
        toast.success("Store vertical created successfully");
      }
      setForm({ name: "", image: null, order: 0, isActive: true });
      setImagePreview(null);
      setOpen(false);
      setEditItem(null);
      fetchStoreVerticals();
    } catch (err) {
      toast.error("Failed to save store vertical");
      console.error("Error saving store vertical:", err);
    }
    setCreating(false);
  };

  const handleEdit = (item: StoreVertical) => {
    setEditItem(item);
    setForm({
      name: item.name,
      image: null,
      order: item.order,
      isActive: item.isActive,
    });
    setImagePreview(getImageUrl(item.image));
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this store vertical?"))
      return;
    try {
      await storeVerticals.deleteStoreVertical(id);
      toast.success("Store vertical deleted successfully");
      fetchStoreVerticals();
    } catch (err) {
      toast.error("Failed to delete store vertical");
      console.error("Error deleting store vertical:", id, err);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await storeVerticals.toggleStoreVerticalStatus(id);
      fetchStoreVerticals();
    } catch (err) {
      toast.error("Failed to update status");
      console.error("Error toggling store vertical status:", id, err);
    }
  };

  const handleDialogClose = () => {
    setOpen(false);
    setEditItem(null);
    setForm({ name: "", image: null, order: 0, isActive: true });
    setImagePreview(null);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#1F2937] tracking-tight">
              Store Verticals
            </h1>
            <p className="text-[#9CA3AF] text-sm mt-1.5">
              Manage store verticals shown as tabs on the storefront
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <Input
                type="search"
                placeholder="Search store verticals..."
                className="pl-9 rounded-full border-[#E5E7EB] bg-[#FFFFFF] focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog
              open={open}
              onOpenChange={(v) => {
                setOpen(v);
                if (!v) handleDialogClose();
              }}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditItem(null);
                    setForm({ name: "", image: null, order: 0, isActive: true });
                    setImagePreview(null);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Store Vertical
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#FFFFFF] border-[#E5E7EB]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-[#1F2937]">
                    {editItem ? "Edit Store Vertical" : "Add Store Vertical"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateOrUpdate} className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-[#4B5563] mb-1.5 block">
                      Name
                    </label>
                    <Input
                      name="name"
                      placeholder="e.g. Nutrition"
                      value={form.name}
                      onChange={handleInputChange}
                      required
                      className="border-[#E5E7EB] focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#4B5563] mb-1.5 block">
                      Image
                    </label>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive
                        ? "bg-[#E8F5E9] border-[#4CAF50]"
                        : "bg-[#F3F7F6] hover:bg-[#F3F4F6]"
                        }`}
                    >
                      <input {...getInputProps()} />
                      {imagePreview ? (
                        <div className="space-y-2">
                          <img
                            src={imagePreview}
                            alt="preview"
                            className="mx-auto h-24 w-24 object-contain rounded-lg border border-[#E5E7EB]"
                          />
                          <p className="text-sm text-[#9CA3AF]">
                            Click or drop to change
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Package className="h-12 w-12 mx-auto text-[#9CA3AF]" />
                          <p className="text-sm text-[#4B5563] font-medium">
                            Drag and drop an image
                          </p>
                          <p className="text-xs text-[#9CA3AF]">
                            or click to select
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-[#4B5563] mb-1.5 block">
                        Order
                      </label>
                      <Input
                        name="order"
                        type="number"
                        value={form.order}
                        onChange={handleInputChange}
                        className="border-[#E5E7EB] focus:border-primary"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-[#4B5563]">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={form.isActive}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-[#E5E7EB] text-[#4CAF50] focus:ring-[#4CAF50]"
                        />
                        Active
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-[#E5E7EB] hover:bg-[#F3F7F6]"
                      onClick={handleDialogClose}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creating} className="flex-1">
                      {creating
                        ? editItem
                          ? "Updating..."
                          : "Creating..."
                        : editItem
                          ? "Update"
                          : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="h-px bg-[#E5E7EB]" />
      </div>

      {isLoading ? (
        <Card className="bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-xl">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#4CAF50]" />
          </div>
        </Card>
      ) : filteredList.length === 0 ? (
        <Card className="bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-xl">
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F3F4F6] mb-4">
              <Package className="h-8 w-8 text-[#9CA3AF]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1F2937] mb-1.5">
              {searchQuery ? "No results found" : "No store verticals yet"}
            </h3>
            <p className="text-sm text-[#9CA3AF] mb-6 max-w-sm mx-auto">
              {searchQuery
                ? "Try a different search term"
                : "Add your first store vertical to get started"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Store Vertical
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card className="bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
          <div className="divide-y divide-[#E5E7EB]">
            {filteredList
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 hover:bg-[#F3F7F6] transition-colors"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="h-16 w-16 object-contain rounded-lg border border-[#E5E7EB] bg-[#F3F7F6] p-2"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-[#1F2937] text-base">
                        {item.name}
                      </h3>
                      <Badge
                        className={
                          item.isActive
                            ? "bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7] text-xs"
                            : "bg-[#F3F4F6] text-[#9CA3AF] border-[#E5E7EB] text-xs"
                        }
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
                      <span className="font-mono">{item.slug}</span>
                      <span>•</span>
                      <span>Order: {item.order}</span>
                      {item.productCount !== undefined && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {item.productCount} products
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-[#F3F4F6]"
                        >
                          <MoreVertical className="h-4 w-4 text-[#4B5563]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-[#FFFFFF] border-[#E5E7EB] shadow-lg"
                      >
                        <DropdownMenuItem
                          className="text-[#1F2937] hover:bg-[#F3F7F6]"
                          onClick={() => handleToggleStatus(item.id)}
                        >
                          {item.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-[#1F2937] hover:bg-[#F3F7F6]"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#E5E7EB]" />
                        <DropdownMenuItem
                          className="text-[#EF4444] hover:bg-[#FEF2F2]"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}
