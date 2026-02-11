import moduleServices from "../api/modules.api";
import { ModuleForm } from "../components/ModuleForm/ModuleForm";

const CreateModulePage = () => {
  const handleSubmit = async (state: any) => {
    await moduleServices.create(state);
    // redirect / toast
  };
  return (
    <div>
      <ModuleForm mode="create" onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateModulePage;
