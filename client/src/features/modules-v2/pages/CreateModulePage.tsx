import { ModuleForm } from "../components/ModuleForm/ModuleForm";
import { ModulesV2API } from "../api/modules.api";

const CreateModulePage = () => {
  const handleSubmit = async (state: any) => {
    await ModulesV2API.create(state);
    // redirect / toast
  };
  return (
    <div>
      <ModuleForm mode="create" onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateModulePage;
