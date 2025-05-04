import React, { useState, useEffect, useMemo } from 'react';
import RegulatoryList from '../components/RegulatoryList';
import RegulatoryContent from '../components/RegulatoryContent';
import RegulatoryEvaluation from '../components/RegulatoryEvaluation';
import {
  fetchRegulatoryISOs,
  fetchRegulatoryContents,
  fetchAllContentsForCache,
  fetchRegulatoryEvaluations,
  fetchEvaluationForContent,
  createEvaluation,
  fetchRoles,
  fetchProcesses,
  fetchActivities,
  fetchWorkProducts,
  uploadFile,
  addRegulatory,
  deleteRegulatory,
  deleteContent,
  updateEvaluation,
  updateContentType,
} from '../services/regulatoryService';

interface RegulatoryISO {
  _id: string;
  name: string;
  description: string;
  source: string;
}

interface Content {
  _id: string;
  text: string;
  type: string;
  regulatoryISO: { _id: string };
}

interface EvidencedBy {
  roles: Array<{ _id: string; name: string }>;
  processes: Array<{ _id: string; name: string }>;
  activities: Array<{ _id: string; name: string }>;
  workProducts: Array<{ _id: string; name: string }>;
}

interface Evaluation {
  _id: string;
  type: 'Header' | 'Definition' | 'Information' | 'Requirement';
  completed: boolean;
  evidencedBy: EvidencedBy;
  regulatoryContent: { _id: string };
}

interface ComplianceStats {
  totalItems: number;
  requirements: number;
  completedRequirements: number;
  chartData: [string, string | number][];
}

const RegulatoryPage: React.FC = () => {
  const [regulatoryISOs, setRegulatoryISOs] = useState<RegulatoryISO[]>([]);
  const [regulatoryContents, setRegulatoryContents] = useState<Content[]>([]);
  const [cachedContents, setCachedContents] = useState<Content[]>([]);
  const [regulatoryEvaluations, setRegulatoryEvaluations] = useState<Evaluation[]>([]);
  const [selectedRegulatory, setSelectedRegulatory] = useState<RegulatoryISO | null>(null);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [roles, setRoles] = useState<Array<{ _id: string; name: string }>>([]);
  const [processes, setProcesses] = useState<Array<{ _id: string; name: string }>>([]);
  const [activities, setActivities] = useState<Array<{ _id: string; name: string }>>([]);
  const [workProducts, setWorkProducts] = useState<Array<{ _id: string; name: string }>>([]);
  const [newRegulatoryName, setNewRegulatoryName] = useState<string>('');
  const [editEvaluation, setEditEvaluation] = useState<Evaluation | null>(null);
  const [loadingContents, setLoadingContents] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [isos, rolesData, processesData, activitiesData, workProductsData] = await Promise.all([
          fetchRegulatoryISOs(),
          fetchRoles(),
          fetchProcesses(),
          fetchActivities(),
          fetchWorkProducts(),
        ]);
        setRegulatoryISOs(isos);
        setRoles(rolesData);
        setProcesses(processesData);
        setActivities(activitiesData);
        setWorkProducts(workProductsData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedRegulatory) {
      setPage(1);
      setRegulatoryContents([]);
      fetchRegulatoryContents(selectedRegulatory._id, 1, itemsPerPage).then(data => {
        setRegulatoryContents(data);
        setLoadingContents(false);
      });
      fetchAllContentsForCache(selectedRegulatory._id).then(setCachedContents);
      fetchRegulatoryEvaluations(selectedRegulatory._id).then(setRegulatoryEvaluations);
    }
  }, [selectedRegulatory]);

  useEffect(() => {
    if (selectedContent) {
      fetchEvaluationForContent(selectedContent._id).then(evaluation => {
        if (!evaluation) {
          createEvaluation(selectedContent._id).then(newEval => setEditEvaluation(newEval));
        } else {
          setEditEvaluation(evaluation);
        }
      });
    } else {
      setEditEvaluation(null);
    }
  }, [selectedContent]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadFile(file);
      if (result.regulatoryISO) {
        setRegulatoryISOs(prev => [...prev, result.regulatoryISO]);
      }
      if (result.contents && result.contents.length > 0) {
        setRegulatoryContents(prev => [...prev, ...result.contents]);
        setCachedContents(prev => [...prev, ...result.contents]);
      }
      if (selectedRegulatory) {
        fetchAllContentsForCache(selectedRegulatory._id).then(setCachedContents);
        fetchRegulatoryEvaluations(selectedRegulatory._id).then(setRegulatoryEvaluations);
      }
    } catch (error) {
      alert('Fehler beim Verarbeiten der Datei');
    }
  };

  const handleAddRegulatory = async () => {
    if (!newRegulatoryName) return;
    try {
      const savedRegulatoryISO = await addRegulatory(newRegulatoryName);
      setRegulatoryISOs(prev => [...prev, savedRegulatoryISO]);
      setNewRegulatoryName('');
    } catch (error) {
      console.error('Error adding regulatory:', error);
    }
  };

  const handleDeleteRegulatory = async (id: string) => {
    try {
      await deleteRegulatory(id);
      setRegulatoryISOs(prev => prev.filter(iso => iso._id !== id));
      setRegulatoryContents(prev => prev.filter(content => content.regulatoryISO._id !== id));
      setCachedContents(prev => prev.filter(content => content.regulatoryISO._id !== id));
      setRegulatoryEvaluations(prev => prev.filter(evaluation => evaluation.regulatoryContent.regulatoryISO !== id));
      setSelectedRegulatory(null);
      setSelectedContent(null);
    } catch (error) {
      console.error('Error deleting regulatory:', error);
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      await deleteContent(id);
      setRegulatoryContents(prev => prev.filter(content => content._id !== id));
      setCachedContents(prev => prev.filter(content => content._id !== id));
      setRegulatoryEvaluations(prev => prev.filter(evaluation => evaluation.regulatoryContent._id !== id));
      if (selectedContent && selectedContent._id === id) setSelectedContent(null);
      if (selectedRegulatory) {
        fetchAllContentsForCache(selectedRegulatory._id).then(setCachedContents);
        fetchRegulatoryEvaluations(selectedRegulatory._id).then(setRegulatoryEvaluations);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const handleEditEvaluation = async () => {
    if (!editEvaluation) return;
    try {
      const updatedEvaluation = await updateEvaluation(editEvaluation);
      setRegulatoryEvaluations(prev => prev.map(evaluation => evaluation._id === updatedEvaluation._id ? updatedEvaluation : evaluation));
      const updatedContent = await updateContentType(editEvaluation.regulatoryContent._id, editEvaluation.type);
      setRegulatoryContents(prev => prev.map(content =>
        content._id === editEvaluation.regulatoryContent._id ? { ...content, type: editEvaluation.type } : content
      ));
      setCachedContents(prev => prev.map(content =>
        content._id === editEvaluation.regulatoryContent._id ? { ...content, type: editEvaluation.type } : content
      ));
      if (selectedRegulatory) {
        fetchAllContentsForCache(selectedRegulatory._id).then(setCachedContents);
        fetchRegulatoryEvaluations(selectedRegulatory._id).then(setRegulatoryEvaluations);
      }
    } catch (error) {
      alert('Fehler beim Speichern der Bewertung: ' + error.message);
    }
  };

  const getComplianceStats = useMemo<ComplianceStats>(() => {
    if (!selectedRegulatory) return { totalItems: 0, requirements: 0, completedRequirements: 0, chartData: [['Status', 'Prozentsatz'], ['Completed', 0], ['Not Completed', 0]] };

    const contentsForISO = cachedContents;
    const totalItems = contentsForISO.length;
    const requirements = contentsForISO.filter(content => content.type === 'Requirement').length;
    const evaluationsForISO = regulatoryEvaluations;
    const completedRequirements = evaluationsForISO.filter(evaluation =>
      evaluation.completed && contentsForISO.find(content => content._id === evaluation.regulatoryContent._id && content.type === 'Requirement')
    ).length;

    const completedPercentage = requirements > 0 ? (completedRequirements / requirements) * 100 : 0;
    const notCompletedPercentage = requirements > 0 ? ((requirements - completedRequirements) / requirements) * 100 : 0;

    console.log('Compliance Stats:', { totalItems, requirements, completedRequirements, completedPercentage, notCompletedPercentage });

    return {
      totalItems,
      requirements,
      completedRequirements,
      chartData: [
        ['Status', 'Prozentsatz'],
        ['Not Completed', notCompletedPercentage],
        ['Completed', completedPercentage],
      ],
    };
  }, [selectedRegulatory, cachedContents, regulatoryEvaluations]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target as HTMLDivElement;
    console.log('Scroll event:', { scrollTop, scrollHeight, clientHeight, loadingContents, currentLength: regulatoryContents.length, totalLength: cachedContents.length });
    if (scrollHeight - scrollTop <= clientHeight + 100 && !loadingContents && regulatoryContents.length < cachedContents.length) {
      console.log('Triggering fetch for next page:', page + 1);
      setPage(prevPage => {
        const newPage = prevPage + 1;
        fetchRegulatoryContents(selectedRegulatory._id, newPage, itemsPerPage).then(data => {
          setRegulatoryContents(prev => prev.concat(data));
          setLoadingContents(false);
        });
        return newPage;
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] p-2 bg-gray-100 dark:bg-gray-800">
      <RegulatoryList
        regulatoryISOs={regulatoryISOs}
        selectedRegulatory={selectedRegulatory}
        newRegulatoryName={newRegulatoryName}
        setRegulatoryISOs={setRegulatoryISOs}
        setSelectedRegulatory={setSelectedRegulatory}
        setSelectedContent={setSelectedContent}
        setNewRegulatoryName={setNewRegulatoryName}
        handleAddRegulatory={handleAddRegulatory}
        handleDeleteRegulatory={handleDeleteRegulatory}
        handleFileUpload={handleFileUpload}
      />
      <RegulatoryContent
        selectedRegulatory={selectedRegulatory}
        regulatoryContents={regulatoryContents}
        cachedContents={cachedContents}
        regulatoryEvaluations={regulatoryEvaluations}
        selectedContent={selectedContent}
        loadingContents={loadingContents}
        setSelectedContent={setSelectedContent}
        handleDeleteContent={handleDeleteContent}
        getComplianceStats={getComplianceStats}
        handleScroll={handleScroll}
      />
      <RegulatoryEvaluation
        selectedContent={selectedContent}
        editEvaluation={editEvaluation}
        setEditEvaluation={setEditEvaluation}
        roles={roles}
        processes={processes}
        activities={activities}
        workProducts={workProducts}
        handleEditEvaluation={handleEditEvaluation}
      />
    </div>
  );
};

export default RegulatoryPage;