import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shekara-dev/ui';

const GapAnalysis = () => {
  return (
    <div className="p-4 flex flex-col">
      <div className={'flex justify-between items-center '}>
        <h3>Research Gaps Identified</h3>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">High Impact</SelectItem>
            <SelectItem value="dark">Medium Impact</SelectItem>
            <SelectItem value="system">Low Impact</SelectItem>
          </SelectContent>
        </Select>      </div>
    </div>
  )
}

export default GapAnalysis;
