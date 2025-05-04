import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { Company, Subsidiary } from "../types/organization";
import SubsidiaryTree from "../components/SubsidiaryTree";

// Interface für die Knoten im Baum
interface TreeNode {
  id: string;
  name: string;
  location: string;
  type: "company" | "building" | "department";
  workHoursDayMaxLoad: number;
  children: TreeNode[];
}

const OrganizationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [company, setCompany] = useState<Company | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "organigram">("list");

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("http://localhost:5001/api/company")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        return r.json();
      })
      .then((data: Company) => {
        const updatedCompany: Company = {
          ...data,
          country: data.country || "",
          timezone: data.timezone || "",
          currency: data.currency || "EUR",
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
        setCompany(updatedCompany || null);
        setLoading(false);
      })
      .catch((error: Error) => {
        console.error("Fehler beim Laden der Daten:", error);
        setError(error.message);
        setCompany(null);
        setLoading(false);
      });
  }, []);

  const handleAddSubsidiary = (parentId: string | null = null) => {
    navigate(`/add-subsidiary${parentId ? `?parentId=${parentId}` : ""}`, {
      state: { companyId: company?._id },
    });
  };

  const handleEditCompany = () => {
    if (company) {
      navigate(`/edit-company/${company._id}`);
    }
  };

  const handleEditSubsidiary = (subsidiaryId: string) => {
    navigate(`/edit-subsidiary/${subsidiaryId}`);
  };

  const buildTreeData = (): TreeNode[] => {
    if (!company) return [];

    const subsidiaryMap = new Map<string, TreeNode>();
    const subsidiaries = company.subsidiaries || [];

    subsidiaries.forEach((sub: Subsidiary) => {
      const nodeId = sub._id.toString();
      const node: TreeNode = {
        id: nodeId,
        name: sub.name || "Kein Name",
        location: sub.location || "Kein Standort",
        type: sub.type || "building",
        workHoursDayMaxLoad: sub.workHoursDayMaxLoad || 0,
        children: [],
      };
      subsidiaryMap.set(nodeId, node);
    });

    subsidiaries.forEach((sub: Subsidiary) => {
      const nodeId = sub._id.toString();
      const parentId = sub.isChildOf?.toString() || null;
      const node = subsidiaryMap.get(nodeId);
      if (parentId && subsidiaryMap.has(parentId)) {
        subsidiaryMap.get(parentId)!.children.push(node!);
      }
      if (sub.subsidiaries && sub.subsidiaries.length > 0) {
        const subSubsidiaryMap = new Map<string, TreeNode>();
        sub.subsidiaries.forEach((subSub: Subsidiary) => {
          const subNodeId = subSub._id.toString();
          const subNode: TreeNode = {
            id: subNodeId,
            name: subSub.name || "Kein Name",
            location: subSub.location || "Kein Standort",
            type: subSub.type || "building",
            workHoursDayMaxLoad: subSub.workHoursDayMaxLoad || 0,
            children: [],
          };
          subSubsidiaryMap.set(subNodeId, subNode);
        });

        sub.subsidiaries.forEach((subSub: Subsidiary) => {
          const subNodeId = subSub._id.toString();
          const subParentId = subSub.isChildOf?.toString() || null;
          const subNode = subSubsidiaryMap.get(subNodeId);
          if (subParentId && subSubsidiaryMap.has(subParentId)) {
            subSubsidiaryMap.get(subParentId)!.children.push(subNode!);
          } else if (subParentId === nodeId) {
            node!.children.push(subNode!);
          }
        });
      }
    });

    const topLevelSubsidiaries: TreeNode[] = [];
    subsidiaries.forEach((sub: Subsidiary) => {
      const nodeId = sub._id.toString();
      const parentId = sub.isChildOf?.toString() || null;
      if (!parentId || !subsidiaryMap.has(parentId)) {
        const node = subsidiaryMap.get(nodeId);
        if (node) {
          topLevelSubsidiaries.push(node);
        }
      }
    });

    topLevelSubsidiaries.sort((a: TreeNode, b: TreeNode) => a.name.localeCompare(b.name));

    return [
      {
        id: company._id.toString(),
        name: company.name || "Hauptfirma",
        location: company.location || "Kein Standort",
        type: "company",
        workHoursDayMaxLoad: company.workHoursDayMaxLoad || 0,
        children: topLevelSubsidiaries,
      },
    ];
  };

  const renderTreeItems = (nodes: TreeNode[]) => {
    if (!nodes || nodes.length === 0) {
      return (
        <div className="text-gray-500 dark:text-gray-400 p-4 text-center">
          Keine Standorte gefunden.
        </div>
      );
    }

    return nodes.map((node) => (
      <div key={node.id} className="mb-2">
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-64">
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {node.name}
              </span>
              {node.type !== "company" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddSubsidiary(node.id);
                  }}
                  className="ml-2 text-brand-600 hover:text-brand-700 dark:text-brand-500 dark:hover:text-brand-400"
                >
                  <svg
                    className="w-4 h-4 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className="w-32 text-gray-500 dark:text-gray-400">{node.location}</div>
            <div className="w-32 text-gray-500 dark:text-gray-400">
              {node.type === "company" ? "Hauptfirma" : node.type}
            </div>
            <div className="w-32 text-gray-500 dark:text-gray-400">
              {node.workHoursDayMaxLoad.toFixed(3)}
            </div>
          </div>
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (node.type === "company") {
                  handleEditCompany();
                } else {
                  handleEditSubsidiary(node.id);
                }
              }}
              className="text-brand-600 hover:text-brand-700 dark:text-brand-500 dark:hover:text-brand-400 font-medium"
            >
              Bearbeiten
            </button>
          </div>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="ml-6 mt-2">{renderTreeItems(node.children)}</div>
        )}
      </div>
    ));
  };

  const handleItemExpansionToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpandedNodes(nodeIds);
  };

  if (loading) return <div className="p-4 text-gray-500 dark:text-gray-400">Loading...</div>;
  if (error) return <div className="p-4 text-red-500 dark:text-red-400">{error}</div>;

  const treeData = buildTreeData();

  return (
    <>
      <PageMeta
        title="React.js Organization Dashboard | SEQ.IST Demonstrator - React.js Admin Dashboard Template"
        description="This is React.js Organization Dashboard page for SEQ.IST Demonstrator - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Organization" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {activeTab === "list" ? "Standort Hierarchie" : "Standortdiagramm"}
          </h3>
          <div className="flex items-center space-x-3">
            {activeTab === "list" && (
              <Link
                to="/add-subsidiary"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                Neuer Standort
              </Link>
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("list")}
                className={`px-4 py-2 rounded-lg ${activeTab === "list" ? "bg-brand-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
              >
                Liste
              </button>
              <button
                onClick={() => setActiveTab("organigram")}
                className={`px-4 py-2 rounded-lg ${activeTab === "organigram" ? "bg-brand-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
              >
                Standortdiagramm
              </button>
            </div>
          </div>
        </div>
        {activeTab === "organigram" ? (
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
            <SubsidiaryTree
              subsidiaries={company?.subsidiaries || []}
              onEditSubsidiary={handleEditSubsidiary}
              companyName={company?.name || "Organisation"}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-64 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs">
                  Standort
                </div>
                <div className="w-32 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs">
                  Ort
                </div>
                <div className="w-32 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs">
                  Typ
                </div>
                <div className="w-32 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs">
                  Max Std / Tag
                </div>
              </div>
              <div className="w-32 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs text-right">
                Aktionen
              </div>
            </div>
            <div className="mt-2">{renderTreeItems(treeData)}</div>
          </div>
        )}
      </div>
    </>
  );
};

export default OrganizationPage;